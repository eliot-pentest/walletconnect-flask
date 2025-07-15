from flask import Flask, send_file
import qrcode
from io import BytesIO

app = Flask(__name__)

@app.route("/")
def index():
    return """
    <html>
      <head><title>Connexion WalletConnect</title></head>
      <body style="text-align:center;">
        <h2>Connexion Trust Wallet</h2>
        <p>Scannez avec Trust Wallet</p>
        <img src="/qr" alt="QR Code" width="300">
        <p>QR dynamique WalletConnect</p>
      </body>
    </html>
    """

@app.route("/qr")
def generate_qr():
    # Remplace cette donnée par ton URI WalletConnect dynamique
    data = "wc:example@1?bridge=https%3A%2F%2Fbridge.walletconnect.org&key=examplekey"
    img = qrcode.make(data)
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    buffer.seek(0)
    return send_file(buffer, mimetype="image/png")

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=10000)
