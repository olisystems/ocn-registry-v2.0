import { ethers as hardhatEthers, network } from "hardhat";
import { Box } from "../typechain";

export async function showBoxValue() {
  const box: Box = await hardhatEthers.getContract("Box");
  const currrentValue = await box.retrieve();
  console.log(`Current Box Value: ${currrentValue} at ${await box.getAddress()}`);
}

  showBoxValue()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
