import { task } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";

task("check-funding", "Displays the funding yearly amount").setAction(async (taskArgs, hre: HardhatRuntimeEnvironment) => {
  const { ethers } = hre;

  const ocnPamentManager: any = await ethers.getContract("OcnPaymentManager");
  console.log(`Funding Yearly Amount of OcnPaymentManager at ${await ocnPamentManager.getAddress()} `);
  const currrentValue = await ocnPamentManager.getFundingYearlyAmount();

  console.log(`${currrentValue} EURSC`);
  console.log("--------------------------------------------------");
});
