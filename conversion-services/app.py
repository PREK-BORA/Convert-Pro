"""Optional Python conversion-service entry point; JavaScript API currently serves supported conversions.""" 
from flask import Flask, jsonify
app = Flask(__name__)

@app.get("/health")
def health():
    return jsonify({"ok": True, "service": "convertpro-python", "converters": []})

@app.post("/convert/<converter>")
def unsupported(converter):
    return jsonify({"error": f"Converter '{converter}' is not configured on this service."}), 501

if __name__ == "__main__":
    app.run(host="127.0.0.1", port=5001)
