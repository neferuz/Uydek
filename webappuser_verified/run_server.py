from flask import Flask, send_from_directory

app = Flask(__name__)

@app.route("/")
def index():
    return send_from_directory("webapp", "index.html")

if __name__ == "__main__":
    print("🌐 Сервер запущен на http://localhost:8080")
    app.run(port=8080)
