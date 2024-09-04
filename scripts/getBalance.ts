import { ethers as hardhatEthers, network, getNamedAccounts } from "hardhat";

async function main() {
  const signers = await hardhatEthers.getSigners();

  // Get the first signer (you can change the index if needed)
  const signer = signers[0];

  // Retrieve the address of the signer
  const signerAddress = await signer.getAddress();

  // Get the balance of the wallet
  const balance = await hardhatEthers.provider.getBalance(signerAddress);

  // Convert balance from Wei to Ether and print it
  console.log(`Balance of ${signerAddress}: ${hardhatEthers.formatEther(balance)} ETH`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
