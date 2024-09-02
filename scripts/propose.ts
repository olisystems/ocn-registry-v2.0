import { ethers as hardhatEthers, network } from "hardhat";
import { developmentChains, VOTING_DELAY, proposalsFile, FUNC, PROPOSAL_DESCRIPTION, NEW_STORE_VALUE } from "../helper-hardhat-config";
import { Box, OcnGovernor } from "../typechain";
import * as fs from "fs";
import { moveBlocks } from "../helper/moveBlocks";

export async function propose(args: any[], functionToCall: string, proposalDescription: string) {
  const ocnGovernor: any = await hardhatEthers.getContract("OcnGovernor");
  const box: Box = await hardhatEthers.getContract("Box");
  const encodedFunction = box.interface.encodeFunctionData(functionToCall as any, args as any);

  console.log(`Proposing: ${encodedFunction} on ${await box.getAddress()} with args: ${args}`);
  console.log(`Proposal description: ${proposalDescription}`);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proposalTx = await ocnGovernor.propose([await box.getAddress()], [0], [encodedFunction], proposalDescription);

  // If working on a development chain, we will push forward till we get to the voting period.
  if (developmentChains.includes(network.name)) {
    await moveBlocks(VOTING_DELAY + 1);
  }
  const proposeReceipt = await proposalTx.wait(1);
  const eventLogs = proposeReceipt.logs.map((log: any) => ocnGovernor.interface.parseLog(log));
  const proposalId = eventLogs[0].args.proposalId;
  console.log(`Proposed with proposal ID:\n  ${proposalId}`);

  const proposalState = await ocnGovernor.state(proposalId);
  const proposalSnapShot = await ocnGovernor.proposalSnapshot(proposalId);
  const proposalDeadline = await ocnGovernor.proposalDeadline(proposalId);

  // save the proposalId
  storeProposalId(proposalId);

  // the Proposal State is an enum data type, defined in the IGovernor contract.
  // 0:Pending, 1:Active, 2:Canceled, 3:Defeated, 4:Succeeded, 5:Queued, 6:Expired, 7:Executed
  console.log(`Current Proposal State: ${proposalState}`);
  // What block # the proposal was snapshot
  console.log(`Current Proposal Snapshot: ${proposalSnapShot}`);
  // The block number the proposal voting expires
  console.log(`Current Proposal Deadline: ${proposalDeadline}`);
}
// TODO put it on the utils
function storeProposalId(proposalId: any) {
  let proposals: any;

  if (fs.existsSync(proposalsFile)) {
    proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
    if (!proposals[network.name]) {
      proposals[network.name] = [];
    }
  } else {
    proposals = {};
    proposals[network.name] = [];
  }
  proposals[network.name].push(proposalId.toString());
  fs.writeFileSync(proposalsFile, JSON.stringify(proposals), "utf8");
}

propose([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
