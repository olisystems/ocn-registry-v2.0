import { ethers, network } from "hardhat";
import { networkExtraConfig, nodeWalletAddress, cpoWalletAdress, defaultAmountToSend } from "../helper-hardhat-config";
import { Wallet } from "ethers";

async function main() {
  const mainPk = networkExtraConfig[network.name].mainPrivateKey;
  if (!mainPk || !nodeWalletAddress || !defaultAmountToSend) {
    console.error("ganachePk, nodeWalletAddress, defaultAmountToSend must be set in helper-hardhat-config.ts");
    process.exit(1);
  }

  // Initialize wallet from the private key
  const wallet: Wallet = new ethers.Wallet(mainPk, ethers.provider);
  // Parse the amount to send in Ether
  const amount = ethers.parseEther(defaultAmountToSend);

  await sendBalance(wallet, nodeWalletAddress, amount);
  await sendBalance(wallet, cpoWalletAdress, amount);
}

async function sendBalance(from: Wallet, to: string, amount: bigint) {
  console.log("-------------------------------------------------------");
  console.log(`Sending ${defaultAmountToSend} ETH from ${from.address} to ${to}...`);
  const tx = {
    to: to,
    value: amount,
  };
  const transactionResponse = await from.sendTransaction(tx);
  console.log("Transaction sent! Hash:", transactionResponse.hash);
  await transactionResponse.wait();
  console.log("Transaction confirmed!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
