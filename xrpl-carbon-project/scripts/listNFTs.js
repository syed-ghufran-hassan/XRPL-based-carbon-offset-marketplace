// listNFTs.js (fixed)
import xrpl from "xrpl";
import dotenv from "dotenv";
dotenv.config();

const RPC = process.env.RPC_URL || "wss://s.altnet.rippletest.net:51233";
const WALLET_SECRET = process.env.WALLET_SECRET;

async function main() {
  const client = new xrpl.Client(RPC);
  await client.connect();
  const wallet = xrpl.Wallet.fromSeed(WALLET_SECRET);
  console.log("Listing NFTs for:", wallet.classicAddress);

  // Fetch all account objects
  const res = await client.request({
    command: "account_objects",
    account: wallet.classicAddress,
    ledger_index: "validated"
  });

  const objs = res.result.account_objects || [];
  let count = 0;

  for (const obj of objs) {
    if (obj.LedgerEntryType === "NFTokenPage" && obj.NFTokens) {
      for (const t of obj.NFTokens) {
        const nf = t.NFToken;
        const uri = nf.URI ? xrpl.convertHexToString(nf.URI) : null;
        console.log("NFTokenID:", nf.NFTokenID, "URI:", uri);
        count++;
      }
    }
  }

  if (count === 0) console.log("No NFTs found for this account.");
  await client.disconnect();
}

main().catch(console.error);
