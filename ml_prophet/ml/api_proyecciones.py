# api_proyecciones.py
from flask import Flask, jsonify
import json
import os
import sys

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_DIR = os.path.join(BASE_DIR, "resultados_ia")
RESULTADO_JSON = os.path.join(OUTPUT_DIR, "proyecciones_semanales_ranking.json")

if not os.path.isdir(OUTPUT_DIR):
    print(f"ERROR: El directorio de salida '{OUTPUT_DIR}' no existe.", file=sys.stderr)
    print("Ejecuta primero 'predecir_semanas.py' para generarlo.", file=sys.stderr)

@app.route('/api/v1/predicciones/semanal', methods=['GET'])
def get_predicciones_semanales():
    try:
        with open(RESULTADO_JSON, 'r', encoding='utf-8') as f:
            data = json.load(f)
        # Devolver directamente el JSON
        return jsonify(data)

    except FileNotFoundError:
        return jsonify({
            "error": "Predicciones no disponibles. El script de MLOps no ha generado el archivo JSON."
        }), 404

    except json.JSONDecodeError:
        return jsonify({
            "error": "Error al leer el archivo JSON. El formato es inválido."
        }), 500

if __name__ == '__main__':
    print("--- SERVIDOR API DE PREDICCIONES INICIADO ---")
    print("  URL: http://localhost:5000/api/v1/predicciones/semanal")
    print("---------------------------------------------")
    app.run(host='0.0.0.0', port=5000)
