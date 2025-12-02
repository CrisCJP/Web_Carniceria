from prophet import Prophet
import pandas as pd

# 1. Cargar dataset
df = pd.read_csv("dataset_carniceria.csv")

# 2. Preparar datos para Prophet
# Prophet necesita columnas: ds (fecha), y (valor)
df_prophet = df.groupby("Fecha").agg({"Demanda_Unidades":"sum"}).reset_index()
df_prophet.rename(columns={"Fecha":"ds","Demanda_Unidades":"y"}, inplace=True)

# 3. Entrenar modelo
model = Prophet()
model.fit(df_prophet)

# 4. Crear futuro (30 días)
future = model.make_future_dataframe(periods=30)
forecast = model.predict(future)

# 5. Guardar predicciones
forecast[['ds','yhat','yhat_lower','yhat_upper']].to_csv("predicciones_carniceria.csv", index=False)
