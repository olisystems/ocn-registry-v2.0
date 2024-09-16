import { ethers, deployments } from "hardhat";
import { expect } from "chai";
import { EuroStableCoin } from "../typechain";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

describe("EuroStableCoin contract", function () {
  let deployer: HardhatEthersSigner;
  let cpoOperator: HardhatEthersSigner;
  let emspOperator: HardhatEthersSigner;
  let stableCoinContract: EuroStableCoin;

  before(async function () {
    [deployer, cpoOperator, emspOperator] = await ethers.getSigners();
  });

  beforeEach(async function () {
    await deployments.fixture(); // Ensure a clean deployment environment
    const preDeployedStablecoin = await deployments.get("EuroStableCoin");
    stableCoinContract = (await ethers.getContractAt("EuroStableCoin", preDeployedStablecoin.address)) as unknown as EuroStableCoin;
  });

  it("Deployment should assign the total supply of tokens to the owner", async function () {
    const ownerBalance = await stableCoinContract.balanceOf(deployer.address);
    expect(await stableCoinContract.totalSupply()).to.equal(ownerBalance);
  });
});
