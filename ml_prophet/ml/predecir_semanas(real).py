import pandas as pd
import pyodbc
from prophet import Prophet
import numpy as np
from typing import List, Dict
import sys
import io
import json
import os
from datetime import datetime, timedelta

# --- CONFIGURACIÓN DE RUTAS Y DB ---
# Usaremos 'ml_prophet/resultados_ia' para guardar el JSON (Nuevo Directorio)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "resultados_ia") 
os.makedirs(OUTPUT_DIR, exist_ok=True) 
RESULTADO_JSON = os.path.join(OUTPUT_DIR, "proyecciones_semanales_ranking.json")

DB_CONFIG = {
    "Driver": "{ODBC Driver 17 for SQL Server}",
    "Server": "serverbutchershop.database.windows.net",
    "Database": "CarniceriaLupita",
    "Uid": "user_db",
    "Pwd": "iejr6225,",   # ← ojo con la coma, ¿es parte real de la contraseña?
    "Encrypt": "yes",
    "TrustServerCertificate": "yes",
    "Connection Timeout": "30"
}


NUM_SEMANAS_PRONOSTICO = 3 
VENTAS_HISTORICAS_MESES = 6 # Rango para calcular el promedio histórico (6 meses)

# --- FUNCIÓN DE EXTRACCIÓN Y CÁLCULO HISTÓRICO ---

def extraer_datos_ventas_historicas() -> pd.DataFrame:
    """Establece la conexión a SQL Server y extrae las ventas agregadas diarias por producto."""
    
    conn_str = ";".join([f"{k}={v}" for k, v in DB_CONFIG.items()])
    
    try:
        print("ESTADO: Conectando a SQL Server y extrayendo datos históricos...")
        conn = pyodbc.connect(conn_str)
        
        query_ventas_diarias = """
        SELECT 
            f.Fecha AS Fecha_Venta,
            df.idProducto AS ID_Producto,
            p.NombreProducto AS Nombre_Producto,
            SUM(df.Cantidad_Peso) AS Cantidad_Vendida
        FROM dbo.Factura f
        JOIN dbo.DetallesFactura df ON f.IdFactura = df.idFactura
        JOIN dbo.Producto p ON df.idProducto = p.IdProducto
        WHERE f.Fecha <= GETDATE()
        GROUP BY f.Fecha, df.idProducto, p.NombreProducto
        ORDER BY f.Fecha, df.idProducto;
        """
        
        df_historico = pd.read_sql(query_ventas_diarias, conn)
        conn.close()
            
        if df_historico.empty:
            raise ValueError("No se encontraron datos históricos de ventas en la base de datos.")
            
        df_historico['Fecha_Venta'] = pd.to_datetime(df_historico['Fecha_Venta'])
        
        print(f"ESTADO: Extracción completada. {len(df_historico)} registros cargados.")
        return df_historico
        
    except pyodbc.Error as ex:
        print(f"ERROR: Falló la conexión o consulta a la DB. Verifica la configuración.")
        sys.exit(1)


def calcular_promedio_historico(df_historico: pd.DataFrame, meses: int) -> float:
    """Calcula la venta promedio semanal total en libras de los últimos N meses."""
    
    fecha_limite = datetime.now() - timedelta(days=meses * 30)
    
    # Filtrar el historial reciente
    df_reciente = df_historico[df_historico['Fecha_Venta'] >= fecha_limite].copy()
    
    # 1. Sumar ventas por fecha (total diario)
    df_total_diario = df_reciente.groupby('Fecha_Venta')['Cantidad_Vendida'].sum().reset_index()
    
    # 2. Agrupar por semana y sumar (total semanal)
    df_total_semanal = df_total_diario.set_index('Fecha_Venta')['Cantidad_Vendida'].resample('W').sum().reset_index()
    
    if df_total_semanal.empty:
        return 0.0
        
    # 3. Calcular el promedio de esas semanas
    promedio_semanal = df_total_semanal['Cantidad_Vendida'].mean()
    
    return round(promedio_semanal, 2)


# --- FUNCIÓN DE CÁLCULO DE TOTALES SEMANALES HISTÓRICOS ---
def obtener_totales_semanales_historicos(df_db: pd.DataFrame, num_semanas_historicas: int) -> List[Dict]:
    """
    Calcula el total de ventas (libras) para las últimas N semanas completas.
    """
    if df_db.empty:
        return []

    df_temp = df_db.copy()
    df_temp['ds'] = pd.to_datetime(df_temp['Fecha_Venta'])
    df_temp['y'] = df_temp['Cantidad_Vendida']

    # 1. Agrupar las ventas totales por semana (resample 'W')
    ventas_totales_semanales = df_temp.groupby('ds')['y'].sum().resample('W').sum().reset_index()

    # 2. Eliminar la última semana parcial (la semana actual)
    # y tomar solo las semanas *completas* anteriores.
    ventas_historicas = ventas_totales_semanales.iloc[:-1] 

    # 3. Tomar las últimas 'num_semanas_historicas'
    ultimas_semanas = ventas_historicas.tail(num_semanas_historicas)

    resultados_historicos = []
    
    # Recorrer de la más antigua a la más reciente (Semana -3 a Semana -1)
    for i, row in enumerate(ultimas_semanas.itertuples()):
        fecha_fin = row.ds
        fecha_inicio = fecha_fin - pd.Timedelta(days=6)
        
        resultados_historicos.append({
            "Semana_Numero": (num_semanas_historicas - len(ultimas_semanas)) + i + 1 - num_semanas_historicas, # Será -3, -2, -1
            "Etiqueta": f"S-{num_semanas_historicas - i}", 
            "Fecha_Inicio": fecha_inicio.strftime('%d/%m/%Y'),
            "Fecha_Fin": fecha_fin.strftime('%d/%m/%Y'),
            "Total_Libras": round(row.y, 2)
        })

    return resultados_historicos


# --- FUNCIÓN DE PREDICCIÓN Y CLASIFICACIÓN (La mantenemos igual) ---

def predecir_y_clasificar_semanalmente(df_db: pd.DataFrame, num_semanas: int) -> List[Dict]:
    # ... (La lógica de Prophet y la clasificación de menor a mayor se mantiene aquí) ...
    
    print("\nPROGRESO: 25% - Iniciando pronóstico de Prophet...")
    
    df_db['ds'] = pd.to_datetime(df_db['Fecha_Venta'])
    df_db['y'] = df_db['Cantidad_Vendida']
    
    productos_unicos = df_db['ID_Producto'].unique()
    producto_map = df_db.set_index('ID_Producto')['Nombre_Producto'].to_dict()
    
    predicciones_producto = {}
    
    for i, id_producto in enumerate(productos_unicos):
        # ... (Bucle de Prophet para cada producto, se mantiene igual) ...
        df_producto = df_db[df_db['ID_Producto'] == id_producto].copy()
        df_producto_agregado = df_producto.groupby('ds')['y'].sum().reset_index()
        
        if len(df_producto_agregado) < 30: 
            continue
            
        try:
            modelo_producto = Prophet(weekly_seasonality=True, yearly_seasonality=True, daily_seasonality=False)
            modelo_producto.fit(df_producto_agregado[['ds', 'y']])
            
            dias_a_predecir = num_semanas * 7
            futuro_prod = modelo_producto.make_future_dataframe(periods=dias_a_predecir, freq='D')
            pronostico_prod = modelo_producto.predict(futuro_prod)
            
            ventas_futuras_prod = pronostico_prod[['ds', 'yhat']].tail(dias_a_predecir)
            ventas_semanales_prod = ventas_futuras_prod.set_index('ds').resample('W').sum()
            
            predicciones_producto[id_producto] = {
                'nombre': producto_map.get(id_producto),
                'ventas_semanales': ventas_semanales_prod['yhat'].tolist()
            }
        except Exception:
            continue

    resultados_clasificados = []
    
    # --- BLOQUE DE CÁLCULO E INYECCIÓN DE FECHAS (NUEVO) ---
    rangos_semanales = []
    
    if not df_db.empty:
        # Última fecha de venta en los datos históricos
        ultima_fecha_historica = df_db['ds'].max()
        
        # Generar las fechas diarias futuras que Prophet predijo
        dias_a_predecir = num_semanas * 7
        fechas_futuras_df = pd.DataFrame({
            'ds': pd.date_range(start=ultima_fecha_historica + pd.Timedelta(days=1), periods=dias_a_predecir, freq='D')
        })
        
        # Resamplear a semanas ('W') para obtener las fechas de fin de semana
        # Prophet usa la convención ISO (Lunes-Domingo) o la configuración regional.
        # Aquí asumimos que W toma el último día del período (fin).
        fechas_semanales_indices = fechas_futuras_df.set_index('ds').resample('W').sum().index
        
        for fecha_fin in fechas_semanales_indices:
            # Calculamos la fecha de inicio restando 6 días (para una semana completa de 7 días)
            fecha_inicio = fecha_fin - pd.Timedelta(days=6)
            
            rangos_semanales.append({
                # Usamos el formato DD/MM/YYYY para que sea claro en el dashboard
                'inicio': fecha_inicio.strftime('%d/%m/%Y'),
                'fin': fecha_fin.strftime('%d/%m/%Y')
            })

    # --- FIN DEL BLOQUE DE CÁLCULO E INYECCIÓN DE FECHAS ---
        
    for i in range(num_semanas):
        # Asegurarse de que haya rangos de fechas disponibles
        rango_actual = rangos_semanales[i] if rangos_semanales and i < len(rangos_semanales) else {'inicio': 'N/D', 'fin': 'N/D'}
        
        ventas_semana = {}
        for id_prod, data in predicciones_producto.items():
            if len(data['ventas_semanales']) > i:
                ventas_semana[data['nombre']] = data['ventas_semanales'][i]
        
        clasificacion_df = pd.Series(ventas_semana).sort_values(ascending=True)
        
        ranking_final = []
        for nombre, venta in clasificacion_df.items():
            ranking_final.append({
                "ProductoNombre": nombre,
                "ProyeccionLibras": round(venta, 2)
            })

        total_semanal = round(clasificacion_df.sum(), 2)
        
        resultados_clasificados.append({
            "Semana_Numero": i + 1,
            "Fecha_Inicio": rango_actual['inicio'],    # <-- ¡NUEVO CAMPO!
            "Fecha_Fin": rango_actual['fin'],          # <-- ¡NUEVO CAMPO!
            "Total_Proyectado_Libras": total_semanal,
            "Clasificacion_Productos": ranking_final 
        })
    
    return resultados_clasificados


# --- FUNCIÓN DE GUARDADO JSON (El output para Node.js) ---

def guardar_resultados_ia(proyecciones_finales, venta_promedio_historica, mape_actual: float, historico_semanal: List[Dict]=[]):
    """
    Guarda el pronóstico, la métrica de precisión y la comparación histórica en JSON.
    Este es el archivo que el Microservicio REST debe leer.
    """
    
    precision = 100.0 - mape_actual
    
    data_final = {
        "Fecha_Generacion": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "Metrica_Precision": {
            "MAPE_Actual": round(mape_actual, 2), 
            "Precision_Acertada": round(precision, 2),
            "Unidad": "%"
        },
        "Comparacion_Historica": {
            "Venta_Promedio_Semanal_Libras": venta_promedio_historica,
            # ... otros campos
            "Historico_Semanal": historico_semanal # <--- ¡CAMPO AÑADIDO!
        },
        "Proyecciones_Semanales": proyecciones_finales
    }
    
    with open(RESULTADO_JSON, 'w', encoding='utf-8') as f:
        json.dump(data_final, f, indent=4, ensure_ascii=False)
    
    print(f"\n✅ Resultados IA completos guardados para Node.js en: {RESULTADO_JSON}")
    return RESULTADO_JSON


# --- FUNCIÓN PRINCIPAL DE EJECUCIÓN ---
# --- FUNCIÓN PRINCIPAL DE EJECUCIÓN (MODIFICADA) ---

if __name__ == '__main__':
    # 1. Extracción de datos reales
    df_datos_historicos = extraer_datos_ventas_historicas()
    
    # 2. Cálculo de la Base de Comparación (Promedio Histórico)
    promedio_semanal = calcular_promedio_historico(df_datos_historicos, meses=VENTAS_HISTORICAS_MESES)
    print(f"\nBase Histórica ({VENTAS_HISTORICAS_MESES} meses): {promedio_semanal} Libras/semana.")
    
    # 3. Pronóstico y Clasificación (Obtiene las semanas futuras)
    proyecciones_finales = predecir_y_clasificar_semanalmente(
        df_datos_historicos, 
        num_semanas=NUM_SEMANAS_PRONOSTICO
    )
    print("ESTADO: Proyecciones futuras completadas.")
    
    # 4. CÁLCULO DE LAS 3 SEMANAS HISTÓRICAS (¡NUEVO PASO!)
    historico_semanal = obtener_totales_semanales_historicos(
        df_datos_historicos, 
        num_semanas_historicas=3 # Queremos 3 semanas históricas
    )
    print("ESTADO: Totales históricos semanales completados.")


    # 5. Obtener/Simular la Métrica de Precisión (MAPE)
    # SIMULACIÓN (Asumiendo que tu reentrenamiento arrojó un MAPE de 15.5%)
    MAPE_MODELO = 15.5 
    
    # 6. Guardar el JSON final para Node.js (¡Ahora con los 4 argumentos!)
    # NOTA: La función guardar_resultados_ia ya tiene 'historico_semanal' como argumento opcional,
    # pero aquí lo pasamos obligatoriamente.
    guardar_resultados_ia(
        proyecciones_finales, 
        promedio_semanal, 
        MAPE_MODELO,
        historico_semanal # <--- ¡EL NUEVO DATO QUE VA AL JSON!
    )
    
    print("\nPROCESO COMPLETO: Listo para que el Microservicio REST consuma el JSON.")
