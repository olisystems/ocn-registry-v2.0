import { ethers, deployments, tasks, network } from "hardhat";
import { expect } from "chai";
import { OcnPaymentManager, EuroStableCoin } from "../typechain";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { PaymentStatus } from "../src/lib/types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("OcnPaymentManager contract", function () {
  let deployer: HardhatEthersSigner;

  let cpoOperator: HardhatEthersSigner;
  let emspOperator: HardhatEthersSigner;
  let paymentManager: OcnPaymentManager;
  let stableCoinContract: EuroStableCoin;
  let hre: HardhatRuntimeEnvironment;

  before(async function () {
    [deployer, cpoOperator, emspOperator] = await ethers.getSigners();
    hre = require("hardhat");
  });

  beforeEach(async function () {
    await deployments.fixture(); // Ensure a clean deployment environment
    const preDeployedStablecoin = await deployments.get("EuroStableCoin");
    stableCoinContract = (await ethers.getContractAt("EuroStableCoin", preDeployedStablecoin.address)) as unknown as EuroStableCoin;
    const preDeployedOcnManager = await deployments.get("OcnPaymentManager");
    paymentManager = (await ethers.getContractAt("OcnPaymentManager", preDeployedOcnManager.address)) as unknown as OcnPaymentManager;

    // call sendStableCoins task
    await hre.run("send-stable-coins", { network: network.name });
  });

  it("Should cpo operator to make a payment and change its status", async function () {
    // Check initial payment status
    let status = await paymentManager.getPaymentStatus(cpoOperator.address);
    expect(Number(status)).to.equal(PaymentStatus.PENDING);

    // Approve the payment manager to spend cpoOperator's stablecoins
    await stableCoinContract.connect(cpoOperator).approve(paymentManager.target, ethers.parseUnits("100", 18));

    // Make a payment
    await paymentManager.connect(cpoOperator).pay();

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
    await paymentManager.connect(emspOperator).pay();

    // Check the staked funds and last payment time
    const stakedFunds = await paymentManager.stakedFunds(emspOperator.address);
    expect(stakedFunds).to.equal(ethers.parseUnits("100", 18));

    // Check final payment status
    status = await paymentManager.getPaymentStatus(emspOperator.address);
    expect(Number(status)).to.equal(PaymentStatus.PAYMENT_UP_TO_DATE);
  });
});
