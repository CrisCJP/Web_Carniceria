import pandas as pd
from prophet import Prophet
import numpy as np
from typing import List, Dict

# --- CONFIGURACIÓN Y SIMULACIÓN DE DATOS (REEMPLAZAR CON TU DB REAL) ---

# Función para simular la carga del dataset grande desde tu DB
def cargar_datos_simulados() -> pd.DataFrame:
    # IMPORTANTE: Reemplaza esto con la conexión pyodbc a tu SQL Server
    # La salida DEBE tener estas tres columnas: Fecha_Venta, ID_Producto, Cantidad_Vendida (en libras)
    
    fechas = pd.date_range(start='2023-01-01', periods=730, freq='D') # 2 años de datos
    productos = {
        1: 'Lomo de Res', 2: 'Pechuga de Pollo', 3: 'Costilla BBQ', 
        4: 'Carne Molida', 5: 'Hígado de Pollo'
    }
    data = []
    
    for fecha in fechas:
        # Simulación de patrón semanal: picos los fines de semana
        es_fin_semana = 1.8 if fecha.weekday() >= 4 else 1.0 
        
        for id_producto, nombre in productos.items():
            # Simular una venta base con ruido
            base_venta = 50 if id_producto in [1, 2] else 20
            cantidad = (base_venta * es_fin_semana) + np.random.randint(0, 15)
            data.append({
                'Fecha_Venta': fecha, 
                'ID_Producto': id_producto, 
                'Nombre_Producto': nombre,
                'Cantidad_Vendida': cantidad 
            })

    return pd.DataFrame(data)

# --- FUNCIÓN DE PREDICCIÓN Y CLASIFICACIÓN ---

def predecir_y_clasificar_semanalmente(df_db: pd.DataFrame, num_semanas: int = 3) -> List[Dict]:
    """
    Realiza el pronóstico semanal por producto y clasifica los resultados.
    
    Args:
        df_db: DataFrame de datos históricos con Fecha_Venta, ID_Producto y Cantidad_Vendida (libras).
        num_semanas: Número de semanas futuras a predecir.

    Returns:
        Una lista de diccionarios, donde cada diccionario contiene la clasificación de una semana.
    """
    
    print("PROGRESO: 10% - Preparando datos para Prophet...")
    
    # 1. Preparación de datos para Prophet
    df_db['ds'] = pd.to_datetime(df_db['Fecha_Venta'])
    df_db['y'] = df_db['Cantidad_Vendida']
    
    productos_unicos = df_db['ID_Producto'].unique()
    producto_map = df_db.set_index('ID_Producto')['Nombre_Producto'].to_dict()
    
    predicciones_producto = {}
    
    print(f"PROGRESO: 25% - Iniciando pronóstico para {len(productos_unicos)} productos...")
    
    # 2. Iteración y Pronóstico por Producto
    for i, id_producto in enumerate(productos_unicos):
        
        # Filtrar el DataFrame para el producto actual
        df_producto = df_db[df_db['ID_Producto'] == id_producto].copy()
        
        # Agregación Diaria (Prophet trabaja mejor a granularidad diaria o menor)
        df_producto_agregado = df_producto.groupby('ds')['y'].sum().reset_index()
        
        if len(df_producto_agregado) < 30: # Asegurar historial mínimo (ej. 30 días)
            print(f"   [AVISO] {producto_map.get(id_producto)} omitido por datos insuficientes.")
            continue
            
        # Entrenar el modelo
        modelo_producto = Prophet(
            weekly_seasonality=True, 
            yearly_seasonality=True,
            daily_seasonality=False
        )
        modelo_producto.fit(df_producto_agregado[['ds', 'y']])
        
        # Generar fechas futuras (Días a predecir)
        dias_a_predecir = num_semanas * 7
        futuro_prod = modelo_producto.make_future_dataframe(periods=dias_a_predecir, freq='D')
        
        # Generar el Pronóstico
        pronostico_prod = modelo_producto.predict(futuro_prod)
        
        # 3. Consolidación Semanal de la Predicción
        
        # Filtrar solo el pronóstico futuro y agrupar por semana
        ventas_futuras_prod = pronostico_prod[['ds', 'yhat']].tail(dias_a_predecir)
        ventas_semanales_prod = ventas_futuras_prod.set_index('ds').resample('W').sum()
        
        # Guardar la lista de predicciones semanales (en libras)
        predicciones_producto[id_producto] = {
            'nombre': producto_map.get(id_producto),
            'ventas_semanales': ventas_semanales_prod['yhat'].tolist()
        }
        
        progreso = 25 + int((i + 1) / len(productos_unicos) * 50)
        print(f"PROGRESO: {progreso}% - Pronóstico completado para {producto_map.get(id_producto)}.")
    
    # 4. Clasificación y Formato de Salida
    
    print("PROGRESO: 80% - Clasificando los resultados...")
    
    resultados_clasificados = []
    
    for i in range(num_semanas):
        # Mapear producto -> venta predicha para la semana actual
        ventas_semana = {}
        for id_prod, data in predicciones_producto.items():
            if len(data['ventas_semanales']) > i:
                # Usamos el nombre del producto como clave para la clasificación final
                ventas_semana[data['nombre']] = data['ventas_semanales'][i]
        
        # Clasificar (ordenar) los productos de menor a mayor venta
        clasificacion_df = pd.Series(ventas_semana).sort_values(ascending=True)
        
        # Formato de salida con la unidad
        ranking_final = []
        for nombre, venta in clasificacion_df.items():
            ranking_final.append({
                "ProductoNombre": nombre,
                "ProyeccionLibras": round(venta, 2)
            })

        # Calcular el total semanal proyectado
        total_semanal = round(clasificacion_df.sum(), 2)
        
        resultados_clasificados.append({
            "Semana_Numero": i + 1,
            "Total_Proyectado_Libras": total_semanal,
            "Clasificacion_Productos": ranking_final 
        })
    
    print("PROGRESO: 100% - Script completado.")
    return resultados_clasificados


# --- EJECUCIÓN DEL SCRIPT ---
if __name__ == '__main__':
    df_datos_historicos = cargar_datos_simulados()
    
    # Obtener el resultado final para las próximas 3 semanas
    proyecciones_finales = predecir_y_clasificar_semanalmente(df_datos_historicos, num_semanas=3)
    
    print("\n\n#####################################################")
    print("RESULTADOS FINALES PARA NODE.JS (3 Semanas)")
    print("#####################################################")
    
    for semana in proyecciones_finales:
        print(f"\n--- 📅 SEMANA {semana['Semana_Numero']} ---")
        print(f"TOTAL PROYECTADO: {semana['Total_Proyectado_Libras']} LIBRAS")
        print("Clasificación (Menos a Más Vendido):")
        
        for item in semana['Clasificacion_Productos']:
            print(f"  - {item['ProductoNombre']}: {item['ProyeccionLibras']} libras")