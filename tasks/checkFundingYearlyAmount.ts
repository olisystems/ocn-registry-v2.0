import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { bigint, string } from "hardhat/internal/core/params/argumentTypes";
import { EuroStableCoin } from "../typechain";

task("check-funding", "Displays the funding yearly amount").setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
  const { ethers, network } = hre;
  const signers = await ethers.getSigners();
  const signer = signers[0];

  const ocnPamentManager: any = await ethers.getContract("OcnPaymentManager");
  console.log(`Funding Yearly Amount of OcnPaymentManager at ${await ocnPamentManager.getAddress()} `);
  const currrentValue = await ocnPamentManager.getFundingYearlyAmount();

  console.log(`${currrentValue} EURSC`);
  console.log("--------------------------------------------------");
});
