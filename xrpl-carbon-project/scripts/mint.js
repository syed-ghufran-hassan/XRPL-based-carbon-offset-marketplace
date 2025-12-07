// mint.js (fixed)
import xrpl from "xrpl";
import dotenv from "dotenv";
dotenv.config();

const WALLET_SECRET = process.env.WALLET_SECRET;
const RPC_URL = process.env.RPC_URL || "wss://s.altnet.rippletest.net:51233";

if (!WALLET_SECRET) {
  console.error("WALLET_SECRET missing in .env");
  process.exit(1);
}

async function main() {
  const client = new xrpl.Client(RPC_URL);
  console.log("Connecting to XRPL testnet...");
  await client.connect();

  const wallet = xrpl.Wallet.fromSeed(WALLET_SECRET);
  console.log("Using wallet:", wallet.classicAddress);

  // Metadata URI (replace with IPFS/HTTPS later)
  const metadataURI = "https://example.com/carbon-credit-001.json";

  // NOTE: Flags set to 0 to avoid temINVALID_FLAG errors on NFTokenMint
  const tx = {
    TransactionType: "NFTokenMint",
    Account: wallet.classicAddress,
    URI: xrpl.convertStringToHex(metadataURI),
    Flags: 0,        // <- safe default
    NFTokenTaxon: 0
  };

  try {
    const prepared = await client.autofill(tx);
    const signed = wallet.sign(prepared);
    console.log("Submitting NFTokenMint transaction...");
    const res = await client.submitAndWait(signed.tx_blob);

    const txResult = res.result?.meta?.TransactionResult || res.result?.engine_result || "unknown";
    const txHash = res.result?.tx_json?.hash || res.result?.hash || res.result?.engine_result_hash || "N/A";

    console.log("Transaction Result:", txResult);
    console.log("Transaction Hash:", txHash);
    console.log(`Explorer TX URL: https://testnet.xrpl.org/transactions/${txHash}`);
    console.log(`Explorer Account URL: https://testnet.xrpl.org/accounts/${wallet.classicAddress}`);

    // List owned NFToken(s) if any
    try {
      const objs = await client.request({
        command: "account_objects",
        account: wallet.classicAddress,
        type: "nf_token_page",
        ledger_index: "validated"
      });
      const pages = objs.result.account_objects || [];
      for (const p of pages) {
        const nf = p.NFToken || [];
        for (const t of nf) {
          const uri = t.URI ? xrpl.convertHexToString(t.URI) : null;
          console.log("NFToken:", t.NFTokenID, "URI:", uri);
        }
      }
    } catch (e) {
      // non-fatal
    }

  } catch (err) {
    console.error("Mint error:", err);
  } finally {
    await client.disconnect();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
