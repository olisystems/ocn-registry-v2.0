import { ethers, deployments } from "hardhat";
import { expect } from "chai";
import { OcnPaymentManager, OcnGovernor } from "../typechain";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ProposalState } from "../src/lib/types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { FUNC_SET_FUNDING_YEARLY_AMOUNT, MIN_DELAY, NEW_YEARLY_AMOUNT, VOTING_DELAY, VOTING_PERIOD } from "../helper-hardhat-config";
import { moveBlocks } from "../helper/moveBlocks";
import { moveTime } from "../helper/moveTime";

describe("OcnPaymentManager contract", function () {
  let deployer: HardhatEthersSigner;

  let cpoOperator: HardhatEthersSigner;
  let emspOperator: HardhatEthersSigner;
  let ocnPaymentManager: OcnPaymentManager;
  let ocnGovernor: OcnGovernor;
  let hre: HardhatRuntimeEnvironment;

  before(async function () {
    [deployer, cpoOperator, emspOperator] = await ethers.getSigners();
    hre = require("hardhat");
  });

  beforeEach(async function () {
    await deployments.fixture(); // Ensure a clean deployment environment
    const preDeployedOcnManager = await deployments.get("OcnPaymentManager");
    ocnPaymentManager = (await ethers.getContractAt("OcnPaymentManager", preDeployedOcnManager.address)) as unknown as OcnPaymentManager;

    const preDeployedOcnGovernor = await deployments.get("OcnGovernor");
    ocnGovernor = (await ethers.getContractAt("OcnGovernor", preDeployedOcnGovernor.address)) as unknown as OcnGovernor;
  });

  async function executeProposalTest(): Promise<string> {
    const encodedFunction = ocnPaymentManager.interface.encodeFunctionData(FUNC_SET_FUNDING_YEARLY_AMOUNT as any, [NEW_YEARLY_AMOUNT]);
    const proposalTx = await ocnGovernor.propose([await ocnPaymentManager.getAddress()], [0], [encodedFunction], "proposal test");
    const proposeReceipt: any = await proposalTx.wait(1);
    const eventLogs = proposeReceipt.logs.map((log: any) => ocnGovernor.interface.parseLog(log));
    const proposalId = eventLogs[0].args.proposalId;
    return proposalId;
  }

  it("Should a proposal be made and status be Pending", async function () {
    const proposalId = await executeProposalTest();
    const status = await ocnGovernor.state(proposalId);
    expect(Number(status)).to.equal(ProposalState.Pending);
  });

  it("Should change proposal to active after moving blocks beyond the VOTING_DELAY", async function () {
    const proposalId = await executeProposalTest();
    let status = await ocnGovernor.state(proposalId);
    expect(Number(status)).to.equal(ProposalState.Pending);
    await moveBlocks(VOTING_DELAY + 1, hre.network, true);
    status = await ocnGovernor.state(proposalId);
    expect(Number(status)).to.equal(ProposalState.Active);
  });

  it("Should vote proposal and verify it is Succeded after moving blocks beyond voting period", async function () {
    const proposalId = await executeProposalTest();
    await moveBlocks(VOTING_DELAY + 1, hre.network);
    const voteTx = await ocnGovernor.castVoteWithReason(proposalId, 1, "Voting for the proposal");
    await voteTx.wait(1);
    await moveBlocks(VOTING_PERIOD + 1, hre.network);
    let status = await ocnGovernor.state(proposalId);
    expect(Number(status)).to.equal(ProposalState.Succeeded);
  });

  it("Should vote against a proposal and verify it is Defeated after moving blocks beyond voting period", async function () {
    const proposalId = await executeProposalTest();
    await moveBlocks(VOTING_DELAY + 1, hre.network);
    const voteTx = await ocnGovernor.castVoteWithReason(proposalId, 0, "Voting against the proposal");
    await voteTx.wait(1);
    await moveBlocks(VOTING_PERIOD + 1, hre.network);
    let status = await ocnGovernor.state(proposalId);
    expect(Number(status)).to.equal(ProposalState.Defeated);
  });

  it("Should be able to queue a proposal that was succeded", async function () {
    const proposalId = await executeProposalTest();
    await moveBlocks(VOTING_DELAY + 1, hre.network);
    const voteTx = await ocnGovernor.castVoteWithReason(proposalId, 1, "Voting for the proposal");
    await voteTx.wait(1);
    await moveBlocks(VOTING_PERIOD + 1, hre.network);

    const encodedFunction = ocnPaymentManager.interface.encodeFunctionData(FUNC_SET_FUNDING_YEARLY_AMOUNT as any, [NEW_YEARLY_AMOUNT]);
    const descriptionHash = ethers.id("proposal test");
    const proposalTx = await ocnGovernor.queue([await ocnPaymentManager.getAddress()], [0], [encodedFunction], descriptionHash);
    await proposalTx.wait(1);
    const status = await ocnGovernor.state(proposalId);
    expect(Number(status)).to.equal(ProposalState.Queued);
  });

  it("Should not be able to queue a proposal that was defeated", async function () {
    const proposalId = await executeProposalTest();
    await moveBlocks(VOTING_DELAY + 1, hre.network);
    const voteTx = await ocnGovernor.castVoteWithReason(proposalId, 0, "Voting against the proposal");
    await voteTx.wait(1);
    await moveBlocks(VOTING_PERIOD + 1, hre.network);

    const encodedFunction = ocnPaymentManager.interface.encodeFunctionData(FUNC_SET_FUNDING_YEARLY_AMOUNT as any, [NEW_YEARLY_AMOUNT]);
    const descriptionHash = ethers.id("proposal test");

    await expect(ocnGovernor.queue([await ocnPaymentManager.getAddress()], [0], [encodedFunction], descriptionHash)).to.be.rejectedWith("GovernorUnexpectedProposalState");

    const status = await ocnGovernor.state(proposalId);
    expect(Number(status)).to.equal(ProposalState.Defeated);
  });

  it("Should be able to execute a proposal that was voted and queued, right after moving blocks MIN_DELAY", async function () {
    const proposalId = await executeProposalTest();
    await moveBlocks(VOTING_DELAY + 1, hre.network);
    const voteTx = await ocnGovernor.castVoteWithReason(proposalId, 1, "Voting for the proposal");
    await voteTx.wait(1);
    await moveBlocks(VOTING_PERIOD + 1, hre.network);
    const encodedFunction = ocnPaymentManager.interface.encodeFunctionData(FUNC_SET_FUNDING_YEARLY_AMOUNT as any, [NEW_YEARLY_AMOUNT]);
    const descriptionHash = ethers.id("proposal test");
    const queueTx = await ocnGovernor.queue([await ocnPaymentManager.getAddress()], [0], [encodedFunction], descriptionHash);
    await queueTx.wait(1);
    await moveTime(MIN_DELAY + 1, hre.network);
    const executeTx = await ocnGovernor.execute([await ocnPaymentManager.getAddress()], [0], [encodedFunction], descriptionHash);
    await executeTx.wait(1);

    const status = await ocnGovernor.state(proposalId);
    expect(Number(status)).to.equal(ProposalState.Executed);
  });
});
