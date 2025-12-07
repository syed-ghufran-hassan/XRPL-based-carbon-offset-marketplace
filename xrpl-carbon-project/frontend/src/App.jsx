import React, { useState } from "react";
import * as xrpl from "xrpl";

const RPC_URL = "wss://s.altnet.rippletest.net:51233";

export default function App() {
  const [seed, setSeed] = useState("");
  const [addr, setAddr] = useState("");
  const [status, setStatus] = useState("");
  const [metadata, setMetadata] = useState("https://black-occupational-pinniped-205.mypinata.cloud/ipfs/bafkreihghhq5puz6knowvyk7dv5vygbbtgsbmg7msauf746fvgy5p3xuv4");

  async function connect() {
    try {
      setStatus("Connecting...");
      const client = new xrpl.Client(RPC_URL);
      await client.connect();
      const wallet = xrpl.Wallet.fromSeed(seed.trim());
      setAddr(wallet.classicAddress);
      setStatus("Connected: " + wallet.classicAddress);
      await client.disconnect();
    } catch (e) {
      setStatus("Connect error: " + String(e));
    }
  }

  async function mint() {
    try {
      setStatus("Minting...");
      const client = new xrpl.Client(RPC_URL);
      await client.connect();
      const wallet = xrpl.Wallet.fromSeed(seed.trim());
      const tx = {
        TransactionType: "NFTokenMint",
        Account: wallet.classicAddress,
        URI: xrpl.convertStringToHex(metadata),
        Flags: 0,
        NFTokenTaxon: 0
      };
      const prepared = await client.autofill(tx);
      const signed = wallet.sign(prepared);
      const res = await client.submitAndWait(signed.tx_blob);
      const result = res.result?.meta?.TransactionResult || res.result?.engine_result;
      const hash = res.result?.tx_json?.hash || res.result?.hash;
      setStatus(`Result: ${result} — TX: ${hash}`);
      await client.disconnect();
    } catch (err) {
      setStatus("Mint error: " + String(err));
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>XRPL Carbon Marketplace — Demo</h2>
      <p style={{ color: "red" }}>Test only — DO NOT paste mainnet seed</p>

      <div>
        <label>Testnet Seed:</label><br/>
        <textarea rows={3} cols={60} value={seed} onChange={e => setSeed(e.target.value)} />
        <br/>
        <button onClick={connect}>Connect</button>
      </div>

      <div style={{ marginTop: 16 }}>
        <b>Wallet:</b> {addr}
      </div>

      <div style={{ marginTop: 16 }}>
        <label>Metadata URI:</label><br/>
        <input style={{ width: 520 }} value={metadata} onChange={e => setMetadata(e.target.value)} />
        <br/>
        <button onClick={mint} style={{ marginTop: 8 }}>Mint from UI</button>
      </div>

      <div style={{ marginTop: 12 }}>
        <b>Status:</b> {status}
      </div>
    </div>
  );
}
