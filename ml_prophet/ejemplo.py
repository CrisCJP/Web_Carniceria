import pandas as pd
from sklearn.metrics import mean_absolute_error, mean_squared_error
import pyodbc
from prophet import Prophet
import plotly

# Conexión a la base en la nube (Azure SQL)
conn = pyodbc.connect(
    "Driver={ODBC Driver 17 for SQL Server};"
    "Server=serverbutchershop.database.windows.net;"
    "Database=CarniceriaLupita;"
    "Uid=user_db;"
    "Pwd=iejr6225,;"  
    "Encrypt=yes;"
    "TrustServerCertificate=yes;"
    "Connection Timeout=30;"
)


# -----------------------------
# Función para calcular métricas
# -----------------------------
def calcular_metricas(y_true, y_pred):
    mae = mean_absolute_error(y_true, y_pred)
    rmse = mean_squared_error(y_true, y_pred, squared=False)
    mape = (abs((y_true - y_pred) / y_true).mean()) * 100
    return mae, rmse, mape

# -----------------------------
# Evaluación por producto
# -----------------------------
def evaluar_por_producto(producto_id):
    try:
        # Leer datos reales desde la base (ejemplo: CSV exportado previamente)
        df_real = pd.read_sql(f"""
            SELECT f.Fecha, SUM(df.Cantidad_Peso) AS Demanda_Unidades
            FROM dbo.Factura f
            JOIN dbo.DetallesFactura df ON f.idFactura = df.idFactura
            JOIN dbo.Lotes l ON df.idLote = l.LoteID
            WHERE l.ProductoID = {producto_id}
            GROUP BY f.Fecha
            ORDER BY f.Fecha;
        """, conn)  # <- si quieres directo desde SQL

        # O bien leer desde CSV generado por Prophet
        df_pred = pd.read_csv("predicciones_carniceria_total.csv")

        # Preparar datos
        df_real.rename(columns={'Fecha': 'ds', 'Demanda_Unidades': 'y'}, inplace=True)
        y_true = df_real['y'].values
        y_pred = df_pred[df_pred['ds'].isin(df_real['ds'])]['yhat'].values

        # Calcular métricas
        mae, rmse, mape = calcular_metricas(y_true, y_pred)
        return {"ProductoID": producto_id, "MAE": mae, "RMSE": rmse, "MAPE": mape}

    except Exception as e:
        print(f"⚠️ Error evaluando producto {producto_id}: {e}")
        return None

# -----------------------------
# Evaluación global
# -----------------------------
def evaluar_global():
    try:
        df_real = pd.read_sql("""
            SELECT f.Fecha, SUM(df.Cantidad_Peso) AS Demanda_Unidades
            FROM dbo.Factura f
            JOIN dbo.DetallesFactura df ON f.idFactura = df.idFactura
            GROUP BY f.Fecha
            ORDER BY f.Fecha;
        """, conn)  # <- directo desde SQL

        df_pred = pd.read_csv("predicciones_carniceria_total.csv")

        df_real.rename(columns={'Fecha': 'ds', 'Demanda_Unidades': 'y'}, inplace=True)
        y_true = df_real['y'].values
        y_pred = df_pred[df_pred['ds'].isin(df_real['ds'])]['yhat'].values

        mae, rmse, mape = calcular_metricas(y_true, y_pred)
        return {"ProductoID": "TOTAL", "MAE": mae, "RMSE": rmse, "MAPE": mape}

    except Exception as e:
        print(f"⚠️ Error evaluando predicción global: {e}")
        return None

# -----------------------------
# Ejecución principal
# -----------------------------
if __name__ == "__main__":
    resultados = []

    # Evaluar productos (ejemplo: IDs conocidos)
    productos = ["PC001", "PC002", "PC003"]  # <- reemplaza con tus ProductoID válidos
    for p in productos:
        r = evaluar_por_producto(p)
        if r:
            resultados.append(r)

    # Evaluar global
    r_global = evaluar_global()
    if r_global:
        resultados.append(r_global)

    # Guardar métricas en CSV
    df_metricas = pd.DataFrame(resultados)
    df_metricas.to_csv("metricas_modelo.csv", index=False)

    print("✅ Evaluación completada. Métricas guardadas en metricas_modelo.csv")
    print(df_metricas)
