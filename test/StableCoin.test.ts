import { ethers, deployments } from "hardhat";
import { expect } from "chai";
import { OcnRegistry, OcnVoteToken } from "../typechain";
import deployVoteToken from "../deploy/01_deployOcnVoteToken";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import exp from "constants";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { Contract } from "ethers";

describe("EuroStableCoin contract", function () {
  let deployer: HardhatEthersSigner;
  let cpoOperator: HardhatEthersSigner;
  let emspOperator: HardhatEthersSigner;
  let stableCoinContract: Contract;

  before(async function () {
    [deployer, cpoOperator, emspOperator] = await ethers.getSigners();
    stableCoinContract = await ethers.deployContract("EuroStableCoin");
  });

  it("Deployment should assign the total supply of tokens to the owner", async function () {
    const ownerBalance = await stableCoinContract.balanceOf(deployer.address);
    expect(await stableCoinContract.totalSupply()).to.equal(ownerBalance);
  });
});
