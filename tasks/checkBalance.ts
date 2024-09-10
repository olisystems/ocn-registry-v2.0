import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { string } from "hardhat/internal/core/params/argumentTypes";
import { EuroStableCoin } from "../typechain";

task("check-balance", "Displays the balance of the first signer")
  .addOptionalParam("address", "address to check balance", undefined, string)
  .setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
    const { ethers } = hre;
    const signers = await ethers.getSigners();
    const signer = signers[0];

    // Retrieve the address of the signer if none address passed as parameter
    const addressToCheck = taskArgs.address ? taskArgs.address : await signer.getAddress();

    // Get the balance of the wallet
    const balance = await ethers.provider.getBalance(addressToCheck);

    // Convert balance from Wei to Ether and print it
    console.log("------------------Balances of ETH (native token)-----------------------");
    console.log(`${addressToCheck}: ${ethers.formatEther(balance)} ETH`);

    const euroStableCoinContract: EuroStableCoin = await ethers.getContract("EuroStableCoin");

    // Show balances
    console.log("\n-----------------------Balances StableCoin-----------------------");
    console.log(`${addressToCheck}: ${hre.ethers.formatEther(await euroStableCoinContract.balanceOf(addressToCheck))} EURSC`);
    console.log("--------------------------------------------------");
  });
