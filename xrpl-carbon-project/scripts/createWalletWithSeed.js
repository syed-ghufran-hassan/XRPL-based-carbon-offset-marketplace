// createWalletWithSeed.js
import xrpl from "xrpl";

async function main() {
  const client = new xrpl.Client("wss://s.altnet.rippletest.net:51233");
  await client.connect();

  console.log("Creating + funding a new Testnet wallet...");
  const fundResult = await client.fundWallet(); // calls faucet
  const wallet = fundResult.wallet;

  console.log("\n=== IMPORTANT - SAVE THESE DETAILS NOW ===");
  console.log("Classic Address:", wallet.classicAddress || wallet.address);
  // xrpl.Wallet has .seed in many versions; also try .seed or .seedHex or .secret
  // We'll print both common properties:
  if (wallet.seed) console.log("Seed (secret):", wallet.seed);
  if (wallet.secret) console.log("Secret:", wallet.secret);
  if (wallet._seed) console.log("_seed:", wallet._seed);
  if (!wallet.seed && !wallet.secret && !wallet._seed) {
    console.log("⚠️ Seed not available as wallet.seed — see NOTE below.");
  }
  console.log("Balance (XRP):", fundResult.balance);
  console.log(`Explorer URL: https://testnet.xrpl.org/accounts/${wallet.classicAddress || wallet.address}`);
  console.log("=========================================\n");

  await client.disconnect();
}

main().catch(e => { console.error("Error creating wallet:", e); process.exit(1); });
