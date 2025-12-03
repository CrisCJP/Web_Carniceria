# api_proyecciones.py
# pip install Flask

from flask import Flask, jsonify
import json
import os
import sys

# Configuración de Flask
app = Flask(__name__)

# --- CONFIGURACIÓN DE RUTAS ---
# Directorio donde 'predecir_semanas.py' guarda el archivo JSON.
# Si 'api_proyecciones.py' está en ml_prophet/, debe buscar en ml_prophet/resultados_ia/
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "resultados_ia") 
RESULTADO_JSON = os.path.join(OUTPUT_DIR, "proyecciones_semanales_ranking.json")

# Verificar si la carpeta de resultados existe al iniciar el servidor
if not os.path.isdir(OUTPUT_DIR):
    print(f"ERROR: El directorio de salida '{OUTPUT_DIR}' no existe.", file=sys.stderr)
    print("Asegúrate de ejecutar primero 'predecir_semanas.py' para crearlo.", file=sys.stderr)

# --- ENDPOINT API REST ---

@app.route('/api/v1/predicciones/semanal', methods=['GET'])
def get_predicciones_semanales():
    """
    Endpoint principal. Lee el archivo JSON pre-calculado y lo devuelve.
    Si el archivo no existe (el modelo no se ha ejecutado), devuelve un 404.
    """
    try:
        # Intentar abrir y leer el artefacto JSON (Evidencia 6.6.1)
        with open(RESULTADO_JSON, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        # Devolver el JSON completo
        return jsonify({
            "status": "success",
            "data": data
        })

    except FileNotFoundError:
        # Este error es crucial para el monitoreo (SLOps 6.5) y operación (5.7)
        return jsonify({
            "status": "error", 
            "message": "Predicciones no disponibles. El script de MLOps no ha generado el archivo JSON."
        }), 404
        
    except json.JSONDecodeError:
        return jsonify({
            "status": "error", 
            "message": "Error al leer el archivo JSON. El formato es inválido."
        }), 500

if __name__ == '__main__':
    # Ejecutar el servidor Flask en el puerto 5000
    print("--- SERVIDOR API DE PREDICCIONES INICIADO ---")
    print(f"  URL: http://127.0.0.1:5000/api/v1/predicciones/semanal")
    print("---------------------------------------------")
    app.run(host='0.0.0.0', port=5000)