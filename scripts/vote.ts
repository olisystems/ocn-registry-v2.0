import * as fs from "fs";
import { network, ethers } from "hardhat";
import { proposalsFile, developmentChains, VOTING_PERIOD } from "../helper-hardhat-config";
import { moveBlocks } from "../helper/moveBlocks";
import { OcnGovernor } from "../typechain";

async function main() {
  const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
  // Get the last proposal for the network. You could also change it for your index
  const proposalId = proposals[network.name].at(-1);
  // 0 = Against, 1 = For, 2 = Abstain for this example
  const voteWay = 1;
  const reason = "OCN Node costs increased";
  await vote(proposalId, voteWay, reason);
}

// 0 = Against, 1 = For, 2 = Abstain for this example
export async function vote(proposalId: string, voteWay: number, reason: string) {
  console.log(`Voting to proposal ${proposalId}...`);
  const ocnGovernor: OcnGovernor = await ethers.getContract("OcnGovernor");
  const voteTx = await ocnGovernor.castVoteWithReason(proposalId, voteWay, reason);
  const voteTxReceipt = await voteTx.wait(1);
  const eventLogs = voteTxReceipt?.logs.map((log: any) => ocnGovernor.interface.parseLog(log));
  if (!eventLogs || eventLogs.length === 0) {
    throw new Error("No event logs found");
  } else {
    let proposalId = eventLogs[0]?.args?.proposalId;
    let proposalState = await ocnGovernor.state(proposalId);
    console.log(`Current Proposal State: ${proposalState}`);
    if (developmentChains.includes(network.name)) {
      await moveBlocks(VOTING_PERIOD + 1, network);
    }
    proposalId = eventLogs[0]?.args?.proposalId;
    proposalState = await ocnGovernor.state(proposalId);
    console.log(`New Proposal State: ${proposalState}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
