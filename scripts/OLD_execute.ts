import { ethers, network } from "hardhat";
import { FUNC, NEW_STORE_VALUE, PROPOSAL_DESCRIPTION, MIN_DELAY, developmentChains } from "../helper-hardhat-config";
import { moveBlocks } from "../helper/moveBlocks";
import { moveTime } from "../helper/moveTime";
import { Box, OcnGovernor } from "../typechain";

export async function queueAndExecute() {
  const args = [NEW_STORE_VALUE];
  const functionToCall = FUNC;
  const box: any = await ethers.getContract("Box");
  const encodedFunctionCall = box.interface.encodeFunctionData(functionToCall, args);
  const descriptionHash = ethers.id(PROPOSAL_DESCRIPTION);
  console.log(descriptionHash);

  const governor: any = await ethers.getContract("OcnGovernor");

  console.log("Executing...");
  // this will fail on a testnet because you need to wait for the MIN_DELAY!
  const executeTx = await governor.execute([await box.getAddress()], [0], [encodedFunctionCall], descriptionHash);
  await executeTx.wait(1);
  console.log(`Box value: ${await box.retrieve()}`);
}

queueAndExecute()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
