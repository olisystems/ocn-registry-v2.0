import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper-functions";
import { developmentChains, MIN_DELAY, QUORUM_PERCENTAGE, VOTING_DELAY, VOTING_PERIOD } from "../helper-hardhat-config";
import { ethers } from "hardhat";
import { Box, OcnGovernor, OcnVoteToken, Timelock } from "../typechain";
import { OcnPaymentManager$Type } from "../artifacts/contracts/OcnPaymentManager.sol/OcnPaymentManager";

const deployFunction: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const { deployer } = await hre.getNamedAccounts();
  const { deployments, network } = hre;
  const { log } = deployments;

  log("----------------------------------------------------");
  log(`Verifying contracts at ${network.name}...`);

  const contractName = process.env.SC;

  if (!developmentChains.includes(network.name)) {
    if (process.env.ETHERSCAN_API_KEY) {
      if (!contractName || contractName === "OcnVoteToken") {
        log("Verifying OcnVoteToken contract...");
        const ocnVoteTokenContract: OcnVoteToken = await ethers.getContract("OcnVoteToken", deployer);
        const ocnVoteTokenArgs: any = [];
        await verify(await ocnVoteTokenContract.getAddress(), ocnVoteTokenArgs);
      }
      if (!contractName || contractName === "Timelock") {
        log("Verifying Timelock contract...");
        const timelockContract: Timelock = await ethers.getContract("Timelock", deployer);
        const timeLockArgs = [MIN_DELAY, [], [], deployer];
        await verify(await timelockContract.getAddress(), timeLockArgs);
      }
      if (!contractName || contractName === "OcnGovernor") {
        log("Verifying OcnGovernor contract...");
        const governorContract: OcnGovernor = await ethers.getContract("OcnGovernor", deployer);
        const governorArgs = [await ethers.getContract("OcnVoteToken", deployer).then((c) => c.getAddress()), await ethers.getContract("Timelock", deployer).then((c) => c.getAddress()), QUORUM_PERCENTAGE, VOTING_PERIOD, VOTING_DELAY];
        await verify(await governorContract.getAddress(), governorArgs);
      }
      if (!contractName || contractName === "OcnPaymentManager") {
        log("Verifying OcnPaymentManager contract...");
        const ocnPaymentManagerContract: any = await ethers.getContract("OcnPaymentManager" as string, deployer);
        const euroStableCoinDeplyedContract = await ethers.getContract("EuroStableCoin", deployer);
        const ocnPaymentManagerContractArgs: any = [euroStableCoinDeplyedContract.target];
        await verify(await ocnPaymentManagerContract.getAddress(), ocnPaymentManagerContractArgs);
      }
      if (!contractName || contractName === "OcnRegistry") {
        log("Verifying OcnRegistry contract...");
        const ocnRegistry: any = await ethers.getContract("OcnRegistry" as string, deployer);
        const ocnPaymentContract = await ethers.getContract("OcnPaymentManager", deployer);
        const ocnRegistryArgs: any = [ocnPaymentContract.target];
        await verify(await ocnRegistry.getAddress(), ocnRegistryArgs);
      }
    } else {
      log("Etherscan API key not found");
    }
  } else {
    log("No verification needed for development network");
  }
};

export default deployFunction;
deployFunction.tags = ["all", "verify"];
