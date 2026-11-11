"""
HAULE BACKUP COMMUNITY - Flask Backend Implementation
Compatible with SQLite and API-Football/FootyStats integration
"""
import os
import json
import sqlite3
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from prediction_engine import calculate_match_predictions

load_dotenv()

app = Flask(__name__)
CORS(app)

DB_PATH = os.path.join(os.path.dirname(__file__), 'haule_community.db')

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            email TEXT UNIQUE,
            username TEXT,
            password_hash TEXT,
            role TEXT DEFAULT 'user',
            membership TEXT DEFAULT 'Free',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS settled_predictions (
            id TEXT PRIMARY KEY,
            match_id TEXT,
            market TEXT,
            selection TEXT,
            confidence INTEGER,
            odds REAL,
            status TEXT,
            score_text TEXT,
            rationale TEXT,
            settled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

init_db()

@app.route('/api/status', methods=['GET'])
def api_status():
    return jsonify({
        "status": "ONLINE",
        "app": "HAULE BACKUP COMMUNITY",
        "confidence_threshold": ">= 75%"
    })

@app.route('/api/predictions/evaluate', methods=['POST'])
def evaluate_fixture():
    data = request.get_json() or {}
    results = calculate_match_predictions(data)
    return jsonify(results)

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
