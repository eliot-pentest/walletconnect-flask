
from flask import Flask, send_file, render_template_string
import os

app = Flask(__name__)

@app.route("/")
def index():
    return render_template_string("""
    <html>
      <head><title>Connexion Trust Wallet</title></head>
      <body style="text-align:center; font-family:sans-serif;">
        <h2>Connexion Trust Wallet</h2>
        <p>Scannez avec Trust Wallet</p>
        <img src="/static/qrcode.png" alt="QR Code" width="300"/>
        <p style="margin-top: 20px;">QR dynamique WalletConnect</p>
      </body>
    </html>
    """)

@app.route("/static/qrcode.png")
def serve_qr():
    return send_file("static/qrcode.png", mimetype="image/png")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)))
