"""Flask Backend API for Advanced Sentinel Core Dashboard."""

from flask import Flask, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)  # Enable CORS so frontend React app can fetch data easily

@app.route('/api/status', methods=['GET'])
def get_status():
    """Endpoint to fetch the latest security report and network status."""
    report_file = "security_report.json"
    if os.path.exists(report_file):
        try:
            with open(report_file, "r", encoding="utf-8") as f:
                data = json.load(f)
            return jsonify(data), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500
    
    return jsonify({
        "network_health_score": 100,
        "gateway": "192.168.1.1",
        "total_connected_nodes": 0,
        "detected_events_count": 0,
        "events": [],
        "message": "No scan report found yet. Run Sentinel Core first."
    }), 200

if __name__ == '__main__':
    print("Starting Advanced Sentinel Core API Server on http://localhost:5000")
    app.run(debug=True, port=5000)