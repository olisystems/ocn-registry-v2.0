import { ethers, network } from "hardhat";
import { FUNC, NEW_STORE_VALUE, PROPOSAL_DESCRIPTION, MIN_DELAY, developmentChains } from "../helper-hardhat-config";
import { moveBlocks } from "../helper/moveBlocks";
import { moveTime } from "../helper/moveTime";
import { Box, OcnGovernor } from "../typechain";

export async function queueAndExecute() {
  const contractName = "OcnPaymentManager";
  const args = [NEW_STORE_VALUE];
  const functionToCall = FUNC;
  // TODO fix types generation and replace any by OcnPaymentManager
  const ocnPaymentManager: any = await ethers.getContract(contractName);
  const encodedFunctionCall = ocnPaymentManager.interface.encodeFunctionData(functionToCall, args);
  const descriptionHash = ethers.id(PROPOSAL_DESCRIPTION);
  console.log(descriptionHash);

  const governor: any = await ethers.getContract("OcnGovernor");

  console.log("Executing...");
  // this will fail on a testnet because you need to wait for the MIN_DELAY!
  const executeTx = await governor.execute([await ocnPaymentManager.getAddress()], [0], [encodedFunctionCall], descriptionHash);
  await executeTx.wait(1);
  console.log(`Current Funding Yearly Amount: ${await ocnPaymentManager.getFundingYearlyAmount()}`);
}

queueAndExecute()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
