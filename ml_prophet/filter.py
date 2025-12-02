import pandas as pd

# 1. Cargar datasets
ventas = pd.read_csv("ventas.csv")
productos = pd.read_csv("productos.csv")

# 2. Limpieza de precios
productos['Precio_Unitario'] = (
    productos['Precio_Unitario']
    .astype(str)
    .str.replace('"', '', regex=False)
    .str.replace(',', '.', regex=False)
)
productos['Precio_Unitario'] = pd.to_numeric(productos['Precio_Unitario'], errors='coerce')

# 3. Diccionario de productos de la carnicería (mapeo)
productos_interes = {
    'Asado': 'Lomo de Res',
    'Pollo': 'Pierna Especial de Pollo',
    'Chorizo': 'Chorizo Criollo',
    'Queso rallado': 'Queso',
    'Queso cremoso': 'Queso',
    'Leche': 'Leche',
    'Costilla de cerdo': 'Costilla de Cerdo',
    'Salchicha': 'Salchicha'
}

# 4. Filtrar solo los productos de interés
df_filtrado = productos[productos['Nombre_producto'].isin(productos_interes.keys())].copy()

# 5. Renombrar con los nombres adaptados
df_filtrado['Nombre_modelo'] = df_filtrado['Nombre_producto'].map(productos_interes)

# 6. Unir con ventas
ventas['Fecha'] = pd.to_datetime(ventas['Fecha'], dayfirst=True, errors='coerce')
ventas = ventas.merge(df_filtrado[['ID_Producto','Nombre_modelo','Precio_Unitario']], on="ID_Producto", how="inner")

# 7. Agrupar por día y producto
dataset_carniceria = ventas.groupby(['Fecha','Nombre_modelo']).agg(
    Demanda_Unidades=('Cantidad','sum'),
    Precio_Unitario=('Precio_Unitario','mean')
).reset_index()

# 8. Guardar dataset final
dataset_carniceria.to_csv("dataset_carniceria.csv", index=False)

print("✅ Dataset filtrado y renombrado creado: dataset_carniceria.csv")
