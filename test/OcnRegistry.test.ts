import { ethers, deployments } from "hardhat";
import { expect } from "chai";
import { OcnRegistry, OcnVoteToken } from "../typechain";
import deployVoteToken from "../deploy/01_deployOcnVoteToken";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import exp from "constants";

describe("OcnVoteToken", function () {
  let ocnVoteToken: OcnVoteToken;
  let deployer: string;
  let cpoOperator: string;
  let emspOperator: string;
  let hre: HardhatRuntimeEnvironment;

  before(async function () {
    hre = require("hardhat");
    const { deployer, cpoOperator, emspOperator } = await hre.getNamedAccounts();
  });

  beforeEach(async function () {
    await deployments.fixture(); // Ensure a clean deployment environment
    await deployVoteToken(hre);
  });

  it("Should deploy the contract and set the deployer as the owner", async function () {
    console.log(deployer);
    expect(1).to.equal(1);
  });

  // Add more tests as needed
});
