import { ethers as hardhatEthers, network } from "hardhat";
import { Box } from "../typechain";

// TODO put it on the helpers
export async function showBoxValue() {
  const ocnPamentManager: any = await hardhatEthers.getContract("OcnPaymentManager");
  const currrentValue = await ocnPamentManager.getFundingYearlyAmount();
  console.log(`Current Funding Yearly Amount Value: ${currrentValue} at ${await ocnPamentManager.getAddress()}`);
}

showBoxValue()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
