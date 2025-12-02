import pandas as pd
import matplotlib.pyplot as plt

# Cargar predicciones
forecast = pd.read_csv("predicciones_carniceria.csv")

# Graficar
plt.figure(figsize=(12,6))
plt.plot(forecast['ds'], forecast['yhat'], label="Predicción", color="blue")
plt.fill_between(forecast['ds'], forecast['yhat_lower'], forecast['yhat_upper'], 
                 color="lightblue", alpha=0.4, label="Intervalo de confianza")
plt.xticks(rotation=45)
plt.title("Predicción de ventas Carnicería Lupita")
plt.xlabel("Fecha")
plt.ylabel("Unidades vendidas")
plt.legend()
plt.tight_layout()
plt.show()
