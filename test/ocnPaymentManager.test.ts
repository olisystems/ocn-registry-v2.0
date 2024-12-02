import { ethers, deployments, tasks, network } from "hardhat";
import { expect } from "chai";
import { OcnPaymentManager, EuroStableCoin, Timelock, OcnGovernor } from "../typechain";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { PaymentStatus, ProposalState } from "../src/lib/types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ADDRESS_ZERO, FUNC_SET_OPERATOR, MIN_DELAY, VOTING_DELAY, VOTING_PERIOD } from "../helper-hardhat-config";
import { moveBlocks } from "../helper/moveBlocks";
import { moveTime } from "../helper/moveTime";
import { toBigInt } from "ethers";

describe("OcnPaymentManager contract", function () {
  let deployer: HardhatEthersSigner;

  let cpoOperator: HardhatEthersSigner;
  let emspOperator: HardhatEthersSigner;
  let registryOperator: HardhatEthersSigner;
  let paymentManager: OcnPaymentManager;
  let ocnGovernor: OcnGovernor;
  let stableCoinContract: EuroStableCoin;
  let hre: HardhatRuntimeEnvironment;

  async function setDefaultOperator(operatorAddress: string) {
    const encodedFunction = paymentManager.interface.encodeFunctionData(FUNC_SET_OPERATOR as any, [operatorAddress]);
    const proposalTx = await ocnGovernor.propose([await paymentManager.getAddress()], [0], [encodedFunction], "proposal test");
    const proposeReceipt: any = await proposalTx.wait(1);
    const eventLogs = proposeReceipt.logs.map((log: any) => ocnGovernor.interface.parseLog(log));
    const proposalId = eventLogs[0].args.proposalId;

    await moveBlocks(VOTING_DELAY + 1, hre.network);
    const voteTx = await ocnGovernor.castVoteWithReason(proposalId, 1, "Voting for the proposal");
    await voteTx.wait(1);
    await moveBlocks(VOTING_PERIOD + 1, hre.network);
    const descriptionHash = ethers.id("proposal test");
    const queueTx = await ocnGovernor.queue([await paymentManager.getAddress()], [0], [encodedFunction], descriptionHash);
    await queueTx.wait(1);
    await moveTime(MIN_DELAY + 1, hre.network);
    const executeTx = await ocnGovernor.execute([await paymentManager.getAddress()], [0], [encodedFunction], descriptionHash);
    await executeTx.wait(1);

    const status = await ocnGovernor.state(proposalId);
    expect(Number(status)).to.equal(ProposalState.Executed);
  }

  before(async function () {
    [deployer, cpoOperator, emspOperator, registryOperator] = await ethers.getSigners();
    hre = require("hardhat");
  });

  beforeEach(async function () {
    await deployments.fixture(); // Ensure a clean deployment environment
    const preDeployedStablecoin = await deployments.get("EuroStableCoin");
    stableCoinContract = (await ethers.getContractAt("EuroStableCoin", preDeployedStablecoin.address)) as unknown as EuroStableCoin;
    const preDeployedOcnManager = await deployments.get("OcnPaymentManager");
    paymentManager = (await ethers.getContractAt("OcnPaymentManager", preDeployedOcnManager.address)) as unknown as OcnPaymentManager;
    const preDeployedOcnGovernor = await deployments.get("OcnGovernor");
    ocnGovernor = (await ethers.getContractAt("OcnGovernor", preDeployedOcnGovernor.address)) as unknown as OcnGovernor;
    // call sendStableCoins task
    await hre.run("send-stable-coins", { network: network.name });
    // Set default registry operator
    await setDefaultOperator(registryOperator.address);
  });

  describe("Initialization", function () {
    it("Should initialize with correct values", async function () {
      expect(await paymentManager.euroStablecoin()).to.equal(stableCoinContract.target);
      expect(await paymentManager.operatorAddress()).to.equal(registryOperator.address);
      const yearlyAmount = await paymentManager.getFundingYearlyAmount();
      expect(yearlyAmount).to.equal(100n); // Assuming 100 is the default yearly amount
    });
  });

  describe("Staking", function () {
    it("Should cpo operator to make a payment and change its status", async function () {
      // Check initial payment status
      let status = await paymentManager.getPaymentStatus(cpoOperator.address);
      expect(Number(status)).to.equal(PaymentStatus.PENDING);

      // Approve the payment manager to spend cpoOperator's stablecoins
      await stableCoinContract.connect(cpoOperator).approve(paymentManager.target, ethers.parseUnits("100", 18));

      // Make a payment
      await paymentManager.connect(cpoOperator).pay(cpoOperator.address);

      // Check the staked funds
      const stakedFunds = await paymentManager.stakedFunds(cpoOperator.address);
      expect(stakedFunds).to.equal(ethers.parseUnits("100", 18));

      // Check final payment status
      status = await paymentManager.getPaymentStatus(cpoOperator.address);
      expect(Number(status)).to.equal(PaymentStatus.PAYMENT_UP_TO_DATE);
    });

    it("Should emsp operator to make a payment and change its status", async function () {
      let status = await paymentManager.getPaymentStatus(emspOperator.address);
      expect(Number(status)).to.equal(PaymentStatus.PENDING);

      // Approve the payment manager to spend cpoOperator's stablecoins
      await stableCoinContract.connect(emspOperator).approve(paymentManager.target, ethers.parseUnits("100", 18));

      // Make a payment
      await paymentManager.connect(emspOperator).pay(emspOperator.address);

      // Check the staked funds and last payment time
      const stakedFunds = await paymentManager.stakedFunds(emspOperator.address);
      expect(stakedFunds).to.equal(ethers.parseUnits("100", 18));

      // Check final payment status
      status = await paymentManager.getPaymentStatus(emspOperator.address);
      expect(Number(status)).to.equal(PaymentStatus.PAYMENT_UP_TO_DATE);
    });
  });


  describe("Withdrawal", function () {
    beforeEach(async function () {
      // Setup initial payment from CPO operator
      await stableCoinContract.connect(cpoOperator).approve(paymentManager.target, ethers.parseUnits("100", 18));
      await paymentManager.connect(cpoOperator).pay(cpoOperator.address);
    });

    it("Should not allow withdrawal before staking period ends", async function () {
      await expect(
        paymentManager.connect(cpoOperator).withdrawToRegistryOperator(cpoOperator.address)
      ).to.be.rejectedWith("WithdrawalNotAllowed");
    });

    it("Should not allow withdrawal if no funds are staked", async function () {
      await expect(
        paymentManager.connect(emspOperator).withdrawToRegistryOperator(emspOperator.address)
      ).to.be.rejectedWith("NoFundsStaked");
    });

    it("Should successfully withdraw funds after staking period", async function () {
      // Get the staking period in blocks
      const stakingPeriodInBlocks = await paymentManager.stakingPeriodInBlocks();

      // Move blocks forward to pass staking period
      await moveBlocks(Number(stakingPeriodInBlocks) + 1, hre.network);

      // Get initial balances
      const initialOperatorBalance = await stableCoinContract.balanceOf(registryOperator.address);
      const initialContractBalance = await stableCoinContract.balanceOf(paymentManager.target);

      // Perform withdrawal
      await paymentManager.connect(cpoOperator).withdrawToRegistryOperator(cpoOperator.address);

      // Check final balances
      const finalOperatorBalance = await stableCoinContract.balanceOf(registryOperator.address);
      const finalContractBalance = await stableCoinContract.balanceOf(paymentManager.target);

      // Verify balances changed correctly
      expect(finalOperatorBalance - initialOperatorBalance).to.equal(ethers.parseUnits("100", 18));
      expect(initialContractBalance - finalContractBalance).to.equal(ethers.parseUnits("100", 18));

      // Verify staked funds were reset
      expect(await paymentManager.stakedFunds(cpoOperator.address)).to.equal(toBigInt(0));

      // Verify payment status changed
      const status = await paymentManager.getPaymentStatus(cpoOperator.address);
      expect(Number(status)).to.equal(PaymentStatus.INSUFFICIENT_FUNDS);
    });

    it("Should emit StakeWithdrawn event on successful withdrawal", async function () {
      // Move blocks forward to pass staking period
      const stakingPeriodInBlocks = await paymentManager.stakingPeriodInBlocks();
      await moveBlocks(Number(stakingPeriodInBlocks) + 1, hre.network);

      // Perform withdrawal and get transaction receipt
       const tx = await paymentManager.connect(cpoOperator).withdrawToRegistryOperator(cpoOperator.address);
       const receipt = await tx.wait();

       // Parse the logs to find the event
       const eventLogs = receipt?.logs.map(log => paymentManager.interface.parseLog(log));
       const withdrawEvent = eventLogs?.find(log => log?.name === "StakeWithdrawn");

       // Verify event exists and has correct arguments
       expect(withdrawEvent).to.not.be.undefined;
       expect(withdrawEvent?.args?.party).to.equal(cpoOperator.address);
       expect(withdrawEvent?.args?.amount).to.equal(ethers.parseUnits("100", 18));
    });

    it("Should not allow withdrawal when operator address is not set", async function () {
      await setDefaultOperator(ADDRESS_ZERO);
      // Setup a new payment manager instance without operator address
      const preDeployedOcnManager = await deployments.get("OcnPaymentManager");
      const newPaymentManager = (await ethers.getContractAt(
        "OcnPaymentManager",
        preDeployedOcnManager.address
      )) as unknown as OcnPaymentManager;

      // Try to withdraw without setting operator address
      await expect(
        newPaymentManager.connect(cpoOperator).withdrawToRegistryOperator(cpoOperator.address)
      ).to.be.rejectedWith("Withdrawal account not set");
    });
  });

});
