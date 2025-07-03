from flask import Flask, send_file, render_template_string
import os

app = Flask(__name__)

@app.route("/")
def index():
    return render_template_string("""
    <html>
      <head><title>Connexion WalletConnect</title></head>
      <body style="text-align:center; font-family:sans-serif;">
        <h2>Connexion Trust Wallet</h2>
        <p>Scannez avec Trust Wallet</p>
        <img src="/qr" width="300" height="300">
        <p style="color:gray;">QR dynamique WalletConnect</p>
      </body>
    </html>
    """)

@app.route("/qr")
def serve_qr():
    if not os.path.exists("static/qrcode.png"):
        return "QR non encore généré.", 404
    return send_file("static/qrcode.png", mimetype="image/png")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
