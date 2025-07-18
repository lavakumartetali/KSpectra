import eventlet
eventlet.monkey_patch()

import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_socketio import SocketIO
from dotenv import load_dotenv
from events import start_simulation

# Load .env
load_dotenv()

# Gemini REST API Config
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"
GEMINI_KEYS = [
    os.getenv("VITE_GEMINI_API_KEY_1"),
    os.getenv("VITE_GEMINI_API_KEY_2")
]

# Flask setup
app = Flask(__name__)
CORS(app)
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins="*")

@app.route('/')
def index():
    return "WebSocket server is running"

# AI Insight Endpoint with automatic API key fallback
@app.route('/api/ai-insight', methods=["POST"])
def ai_insight():
    data = request.get_json()
    prompt = data.get("prompt", "").strip()

    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400

    payload = {
        "contents": [
            {
                "parts": [
                    { "text": prompt }
                ]
            }
        ]
    }

    # Try each API key until one works or all fail
    for key in GEMINI_KEYS:
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": key
        }

        try:
            response = requests.post(GEMINI_API_URL, headers=headers, json=payload, timeout=10)
            response.raise_for_status()
            result = response.json()

            reply = result['candidates'][0]['content']['parts'][0]['text']
            return jsonify({"message": reply})

        except requests.exceptions.HTTPError as http_err:
            print(f"HTTP Error with key {key[:6]}***:", http_err)
            if response.status_code == 429:
                continue  # Try next key on rate limit
            return jsonify({"error": "⚠️ API Error: Unable to process your request."}), 500
        except requests.exceptions.Timeout:
            print("Timeout Error")
            return jsonify({"error": "⚠️ Request timed out. Please try again later."}), 500
        except Exception as e:
            print("Unexpected Error:", e)
            return jsonify({"error": "⚠️ Something went wrong. Please try again later."}), 500

    return jsonify({"error": "⚠️ All API keys are currently rate-limited. Please try again later."}), 429

# ✅ Start WebSocket simulation
if __name__ == '__main__':
    start_simulation(socketio)
    socketio.run(app, host='0.0.0.0', port=5000)
