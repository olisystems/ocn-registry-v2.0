import { ethers, network } from "hardhat";
import { FUNC, NEW_STORE_VALUE, PROPOSAL_DESCRIPTION, MIN_DELAY, developmentChains } from "../helper-hardhat-config";
import { moveBlocks } from "../helper/moveBlocks";
import { moveTime } from "../helper/moveTime";
import { OcnGovernor } from "../typechain";

export async function queueAndExecute() {
  const args = [NEW_STORE_VALUE];
  const functionToCall = FUNC;
  const ocnPaymentManager: any = await ethers.getContract("OcnPaymentManager");
  const encodedFunctionCall = ocnPaymentManager.interface.encodeFunctionData(functionToCall, args);
  const descriptionHash = ethers.id(PROPOSAL_DESCRIPTION);
  console.log(descriptionHash);

  const governor: any = await ethers.getContract("OcnGovernor");
  console.log("Queueing...");
  const queueTx = await governor.queue([await ocnPaymentManager.getAddress()], [0], [encodedFunctionCall], descriptionHash);
  await queueTx.wait(1);

  if (developmentChains.includes(network.name)) {
    await moveTime(MIN_DELAY + 1);
    await moveBlocks(1);
  }

  const currrentValue = await ocnPaymentManager.getFundingYearlyAmount();
  console.log(`Current Funding Yearly Amount Value: ${currrentValue} at ${await ocnPaymentManager.getAddress()}`);
}

queueAndExecute()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
