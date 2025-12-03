import pandas as pd
import pyodbc
from prophet import Prophet
from sklearn.metrics import mean_absolute_error, mean_squared_error
import numpy as np
from datetime import datetime
import pickle
import os
import sys
import io

# Forzar salida UTF-8 y evitar buffering
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# --- Carpetas de salida (relativas y portables) ---
BASE_DIR = os.path.join(os.path.dirname(__file__), "ml")
PKL_DIR = os.path.join(BASE_DIR, "pkl")
CSV_DIR = os.path.join(BASE_DIR, "csv")
os.makedirs(PKL_DIR, exist_ok=True)
os.makedirs(CSV_DIR, exist_ok=True)

print("PROGRESO:5%", flush=True)
print("ESTADO:Conectando a la base de datos...", flush=True)

# --- Conexión a la base en la nube (Azure SQL) ---
# conn = pyodbc.connect(
#     "Driver={ODBC Driver 17 for SQL Server};"
#     "Server=serverbutchershop.database.windows.net;"
#     "Database=CarniceriaLupita;"
#     "Uid=user_db;"
#     "Pwd=iejr6225,;"
#     "Encrypt=yes;"
#     "TrustServerCertificate=no;"
#     "Connection Timeout=30;"
# )

# --- Conexión a la base en local (SQL Server) ---
conn = pyodbc.connect(
    "Driver={ODBC Driver 17 for SQL Server};"
    "Server=localhost;"
    "Database=CarniceriaLupita;"
    "Uid=user_db;"
    "Pwd=12345;"
    "Encrypt=yes;"
    "TrustServerCertificate=yes;"
    "Connection Timeout=30;"
)

print("PROGRESO:12%", flush=True)
print("ESTADO:Consultando y preparando datos...", flush=True)

# --- Consultas ---
query_por_producto_diario = """
SELECT 
    f.Fecha,
    df.idProducto AS ProductoID,
    p.NombreProducto AS ProductoNombre,
    SUM(df.Cantidad_Peso) AS Demanda_Unidades
FROM dbo.Factura f
JOIN dbo.DetallesFactura df ON f.IdFactura = df.idFactura
JOIN dbo.Producto p ON df.idProducto = p.IdProducto
WHERE f.Fecha <= GETDATE()
GROUP BY f.Fecha, df.idProducto, p.NombreProducto
ORDER BY f.Fecha, df.idProducto;
"""

query_total_diario = """
SELECT 
    f.Fecha,
    SUM(df.Cantidad_Peso) AS Demanda_Unidades
FROM dbo.Factura f
JOIN dbo.DetallesFactura df ON f.IdFactura = df.idFactura
WHERE f.Fecha <= GETDATE()
GROUP BY f.Fecha
ORDER BY f.Fecha;
"""

query_por_producto_semana = """
SELECT 
    DATEPART(YEAR, f.Fecha) AS Año,
    DATEPART(WEEK, f.Fecha) AS Semana,
    df.idProducto AS ProductoID,
    p.NombreProducto AS ProductoNombre,
    SUM(df.Cantidad_Peso) AS Demanda_Unidades
FROM dbo.Factura f
JOIN dbo.DetallesFactura df ON f.IdFactura = df.idFactura
JOIN dbo.Producto p ON df.idProducto = p.IdProducto
WHERE f.Fecha <= GETDATE()
GROUP BY DATEPART(YEAR, f.Fecha), DATEPART(WEEK, f.Fecha), df.idProducto, p.NombreProducto
ORDER BY Año, Semana, ProductoID;
"""

query_total_semana = """
SELECT 
    DATEPART(YEAR, f.Fecha) AS Año,
    DATEPART(WEEK, f.Fecha) AS Semana,
    SUM(df.Cantidad_Peso) AS Demanda_Unidades
FROM dbo.Factura f
JOIN dbo.DetallesFactura df ON f.IdFactura = df.idFactura
WHERE f.Fecha <= GETDATE()
GROUP BY DATEPART(YEAR, f.Fecha), DATEPART(WEEK, f.Fecha)
ORDER BY Año, Semana;
"""

# --- Leer datos ---
df_prod_diario = pd.read_sql(query_por_producto_diario, conn)
df_total_diario = pd.read_sql(query_total_diario, conn)
df_prod_semana = pd.read_sql(query_por_producto_semana, conn)
df_total_semana = pd.read_sql(query_total_semana, conn)

print("PROGRESO:20%", flush=True)
print("ESTADO:Procesando fechas semanales...", flush=True)

# --- Convertir Año+Semana a fecha (lunes de cada semana) ---
df_prod_semana['FechaSemana'] = pd.to_datetime(
    df_prod_semana['Año'].astype(str) + df_prod_semana['Semana'].astype(str) + '1',
    format='%Y%U%w'
)
df_total_semana['FechaSemana'] = pd.to_datetime(
    df_total_semana['Año'].astype(str) + df_total_semana['Semana'].astype(str) + '1',
    format='%Y%U%w'
)

# --- Rankings y totales ---
productos_hoy = []
productos_semana = []

# --- Fechas actuales ---
hoy = datetime.now().strftime("%Y-%m-%d")
hoy_legible = datetime.now().strftime("%d-%m-%Y")
semana_actual = datetime.now().strftime("%Y-%U")
semana_legible = datetime.now().strftime("Semana %U, %Y")

# --- Predicciones por producto (Diario + Semanal) ---
productos_validos = df_prod_diario['ProductoID'].dropna().unique()

print("PROGRESO:25%", flush=True)
print(f"ESTADO:Iniciando entrenamiento por producto ({len(productos_validos)} productos)...", flush=True)

total = len(productos_validos)
if total > 0:
    for i, producto in enumerate(productos_validos):
        # Progreso entre 25% y 80% durante el loop
        progreso_actual = int(25 + (i / max(total, 1)) * 55)

        # Nombre del producto
        nombre_producto = df_prod_diario[df_prod_diario['ProductoID'] == producto]['ProductoNombre'].iloc[0]

        # ------------------ Diario ------------------
        df_producto_diario = df_prod_diario[df_prod_diario['ProductoID'] == producto][['Fecha','Demanda_Unidades']].copy()
        df_producto_diario.rename(columns={'Fecha':'ds','Demanda_Unidades':'y'}, inplace=True)

        print(f"ESTADO:Entrenando modelo diario para {nombre_producto}...", flush=True)

        if len(df_producto_diario) >= 10:
            modelo_diario = Prophet(weekly_seasonality=True)
            modelo_diario.fit(df_producto_diario[['ds','y']])

            futuro_diario = modelo_diario.make_future_dataframe(periods=30, freq='D')
            pred_diario = modelo_diario.predict(futuro_diario)

            # Evaluación histórico diario
            pred_hist_diario = modelo_diario.predict(df_producto_diario[['ds','y']])
            mae_d = mean_absolute_error(df_producto_diario['y'], pred_hist_diario['yhat'])
            rmse_d = np.sqrt(mean_squared_error(df_producto_diario['y'], pred_hist_diario['yhat']))
            mape_d = np.mean(np.abs((df_producto_diario['y'] - pred_hist_diario['yhat']) / df_producto_diario['y'])) * 100

            if mape_d > 50:
                print(f"[DIARIO] {nombre_producto} MAPE: {mape_d:.2f}% -> Prediccion poco confiable.", flush=True)
            else:
                print(f"[DIARIO] {nombre_producto} MAE: {mae_d:.2f}, RMSE: {rmse_d:.2f}, MAPE: {mape_d:.2f}%", flush=True)

            # Guardar modelo y predicciones
            with open(os.path.join(PKL_DIR, f"modelo_producto_{producto}_diario.pkl"), "wb") as f:
                pickle.dump(modelo_diario, f)

            pred_diario_out = pred_diario.copy()
            pred_diario_out['ProductoID'] = producto
            pred_diario_out['ProductoNombre'] = nombre_producto
            pred_diario_out[['ds','ProductoID','ProductoNombre','yhat','yhat_lower','yhat_upper']].to_csv(
                os.path.join(CSV_DIR, f"predicciones_producto_{producto}_diario.csv"), index=False
            )

            # Ranking diario (HOY)
            pred_hoy = pred_diario[pred_diario['ds'] == hoy]
            if not pred_hoy.empty:
                productos_hoy.append({
                    "ProductoID": producto,
                    "ProductoNombre": nombre_producto,
                    "VentasHoy": float(pred_hoy['yhat'].values[0])
                })
        else:
            print(f"[DIARIO] {nombre_producto}: historial insuficiente ({len(df_producto_diario)} dias).", flush=True)

        print(f"PROGRESO:{progreso_actual}", flush=True)

        # ------------------ Semanal ------------------
        df_producto_semana = df_prod_semana[df_prod_semana['ProductoID'] == producto][['FechaSemana','Demanda_Unidades','ProductoNombre']].copy()
        df_producto_semana.rename(columns={'FechaSemana':'ds','Demanda_Unidades':'y'}, inplace=True)

        print(f"ESTADO:Entrenando modelo semanal para {nombre_producto}...", flush=True)

        if len(df_producto_semana) >= 10:
            modelo_semana = Prophet(weekly_seasonality=False, yearly_seasonality=True)
            modelo_semana.fit(df_producto_semana[['ds','y']])

            futuro_semana = modelo_semana.make_future_dataframe(periods=12, freq='W')
            pred_semana = modelo_semana.predict(futuro_semana)

            # Evaluación histórico semanal
            pred_hist_semana = modelo_semana.predict(df_producto_semana[['ds','y']])
            mae_s = mean_absolute_error(df_producto_semana['y'], pred_hist_semana['yhat'])
            rmse_s = np.sqrt(mean_squared_error(df_producto_semana['y'], pred_hist_semana['yhat']))
            mape_s = np.mean(np.abs((df_producto_semana['y'] - pred_hist_semana['yhat']) / df_producto_semana['y'])) * 100

            if mape_s > 50:
                print(f"[SEMANAL] {nombre_producto} MAPE: {mape_s:.2f}% -> Prediccion poco confiable.", flush=True)
            else:
                print(f"[SEMANAL] {nombre_producto} MAE: {mae_s:.2f}, RMSE: {rmse_s:.2f}, MAPE: {mape_s:.2f}%", flush=True)

            # Guardar modelo y predicciones
            with open(os.path.join(PKL_DIR, f"modelo_producto_{producto}_semanal.pkl"), "wb") as f:
                pickle.dump(modelo_semana, f)

            pred_semana_out = pred_semana.copy()
            pred_semana_out['ProductoID'] = producto
            pred_semana_out['ProductoNombre'] = nombre_producto
            pred_semana_out[['ds','ProductoID','ProductoNombre','yhat','yhat_lower','yhat_upper']].to_csv(
                os.path.join(CSV_DIR, f"predicciones_producto_{producto}_semanal.csv"), index=False
            )

            # Ranking semanal (SEMANA ACTUAL)
            pred_sem_actual = pred_semana[pred_semana['ds'].dt.strftime("%Y-%U") == semana_actual]
            if not pred_sem_actual.empty:
                productos_semana.append({
                    "ProductoID": producto,
                    "ProductoNombre": nombre_producto,
                    "VentasSemana": float(pred_sem_actual['yhat'].values[0])
                })
        else:
            print(f"[SEMANAL] {nombre_producto}: historial insuficiente ({len(df_producto_semana)} semanas).", flush=True)

        print(f"PROGRESO:{min(progreso_actual + 1, 80)}", flush=True)

else:
    print("ESTADO:No se encontraron productos en las ventas. Se omiten predicciones por producto.", flush=True)

# --- Modelos GLOBAL (Diario + Semanal) ---
print("PROGRESO:85%", flush=True)
print("ESTADO:Entrenando modelo global diario...", flush=True)

df_total_diario = df_total_diario.rename(columns={'Fecha':'ds','Demanda_Unidades':'y'})
if {'ds','y'}.issubset(df_total_diario.columns) and len(df_total_diario) >= 10:
    modelo_total_diario = Prophet(weekly_seasonality=True)
    modelo_total_diario.fit(df_total_diario[['ds','y']])

    futuro_total_diario = modelo_total_diario.make_future_dataframe(periods=30, freq='D')
    pred_total_diario = modelo_total_diario.predict(futuro_total_diario)

    # Evaluación histórico total diario
    pred_total_hist_d = modelo_total_diario.predict(df_total_diario[['ds','y']])
    mae_td = mean_absolute_error(df_total_diario['y'], pred_total_hist_d['yhat'])
    rmse_td = np.sqrt(mean_squared_error(df_total_diario['y'], pred_total_hist_d['yhat']))
    mape_td = np.mean(np.abs((df_total_diario['y'] - pred_total_hist_d['yhat']) / df_total_diario['y'])) * 100
    print(f"[GLOBAL DIARIO] Carniceria MAE: {mae_td:.2f}, RMSE: {rmse_td:.2f}, MAPE: {mape_td:.2f}%", flush=True)

    with open(os.path.join(PKL_DIR, "modelo_carniceria_total_diario.pkl"), "wb") as f:
        pickle.dump(modelo_total_diario, f)

    pred_total_diario_out = pred_total_diario.copy()
    pred_total_diario_out['ProductoID'] = 'TOTAL'
    pred_total_diario_out['ProductoNombre'] = 'Carniceria Lupita'
    pred_total_diario_out[['ds','ProductoID','ProductoNombre','yhat','yhat_lower','yhat_upper']].to_csv(
        os.path.join(CSV_DIR, "predicciones_carniceria_total_diario.csv"), index=False
    )
    print("ESTADO:Prediccion global diaria guardada.", flush=True)
else:
    print(f"[GLOBAL DIARIO] Historial insuficiente ({len(df_total_diario)} dias) o columnas incorrectas.", flush=True)

print("PROGRESO:92%", flush=True)
print("ESTADO:Entrenando modelo global semanal...", flush=True)

df_total_semana = df_total_semana.rename(columns={'FechaSemana':'ds','Demanda_Unidades':'y'})
if {'ds','y'}.issubset(df_total_semana.columns) and len(df_total_semana) >= 10:
    modelo_total_semana = Prophet(weekly_seasonality=False, yearly_seasonality=True)
    modelo_total_semana.fit(df_total_semana[['ds','y']])

    futuro_total_semana = modelo_total_semana.make_future_dataframe(periods=12, freq='W')
    pred_total_semana = modelo_total_semana.predict(futuro_total_semana)

    # Evaluación histórico total semanal
    pred_total_hist_s = modelo_total_semana.predict(df_total_semana[['ds','y']])
    mae_ts = mean_absolute_error(df_total_semana['y'], pred_total_hist_s['yhat'])
    rmse_ts = np.sqrt(mean_squared_error(df_total_semana['y'], pred_total_hist_s['yhat']))
    mape_ts = np.mean(np.abs((df_total_semana['y'] - pred_total_hist_s['yhat']) / df_total_semana['y'])) * 100
    print(f"[GLOBAL SEMANAL] Carniceria MAE: {mae_ts:.2f}, RMSE: {rmse_ts:.2f}, MAPE: {mape_ts:.2f}%", flush=True)

    with open(os.path.join(PKL_DIR, "modelo_carniceria_total_semanal.pkl"), "wb") as f:
        pickle.dump(modelo_total_semana, f)

    pred_total_semana_out = pred_total_semana.copy()
    pred_total_semana_out['ProductoID'] = 'TOTAL'
    pred_total_semana_out['ProductoNombre'] = 'Carniceria Lupita'
    pred_total_semana_out[['ds','ProductoID','ProductoNombre','yhat','yhat_lower','yhat_upper']].to_csv(
        os.path.join(CSV_DIR, "predicciones_carniceria_total_semanal.csv"), index=False
    )
    print("ESTADO:Prediccion global semanal guardada.", flush=True)
else:
    print(f"[GLOBAL SEMANAL] Historial insuficiente ({len(df_total_semana)} semanas) o columnas incorrectas.", flush=True)

print("PROGRESO:98%", flush=True)
print("ESTADO:Generando rankings y totales proyectados...", flush=True)

# --- Rankings finales ---
# Ranking diario (HOY)
if productos_hoy:
    productos_ordenados_hoy = sorted(productos_hoy, key=lambda x: x['VentasHoy'], reverse=True)
    print(f"Ok, hoy es {hoy_legible}, estos son los productos que mas se van a vender:", flush=True)
    for i, p in enumerate(productos_ordenados_hoy, start=1):
        print(f"{i}. {p['ProductoNombre']} {p['VentasHoy']:.2f} libras proyectadas", flush=True)
else:
    print(f"Ningun producto muestra ventas proyectadas para hoy ({hoy_legible}) en el modelo.", flush=True)

# Ranking semanal (SEMANA ACTUAL)
if productos_semana:
    productos_ordenados_sem = sorted(productos_semana, key=lambda x: x['VentasSemana'], reverse=True)
    print(f"Ok, {semana_legible}, estos son los productos que mas se van a vender:", flush=True)
    for i, p in enumerate(productos_ordenados_sem, start=1):
        print(f"{i}. {p['ProductoNombre']} {p['VentasSemana']:.2f} libras proyectadas", flush=True)
else:
    print(f"Ningun producto muestra ventas proyectadas para {semana_legible} en el modelo.", flush=True)

# --- Totales proyectados ---
if productos_hoy:
    total_hoy = sum(p['VentasHoy'] for p in productos_hoy)
    print(f"Total proyectado HOY ({hoy_legible}): {total_hoy:.2f} libras en toda la carniceria.", flush=True)

if productos_semana:
    total_semana = sum(p['VentasSemana'] for p in productos_semana)
    print(f"Total proyectado {semana_legible}: {total_semana:.2f} libras en toda la carniceria.", flush=True)

# --- Exportar CSV simplificados para frontend ---
# Estos son los archivos que tu endpoint /predicciones leerá y el frontend renderizará
if productos_hoy:
    df_hoy = pd.DataFrame(productos_hoy)[["ProductoNombre", "VentasHoy"]]
    df_hoy.to_csv(os.path.join(CSV_DIR, "predicciones_hoy.csv"), index=False)

if productos_semana:
    df_sem = pd.DataFrame(productos_semana)[["ProductoNombre", "VentasSemana"]]
    df_sem.to_csv(os.path.join(CSV_DIR, "predicciones_semana.csv"), index=False)

print("PROGRESO:100%", flush=True)
print("ESTADO:Reentrenamiento completado. Modelos y CSV generados correctamente.", flush=True)