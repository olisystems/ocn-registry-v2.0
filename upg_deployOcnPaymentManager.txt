import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { storeProxyAddress } from "../helper/storeJson";
import verify from "../helper-functions";
import { networkExtraConfig, proxiesFile } from "../helper-hardhat-config";
import { ethers, upgrades } from "hardhat";
import fs from "fs";

const deployVoteToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const contractName = "OcnPaymentManager";
  const { deployer } = await hre.getNamedAccounts();
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;

  log("----------------------------------------------------");
  log(`Deploying ${contractName} at ${network.name} and waiting for confirmations...`);
  const euroStableCoinDeplyedContract = await ethers.getContract("EuroStableCoin", deployer);

  const ocnPaymentManagerContract = await ethers.getContractFactory(contractName);
  const ocnPaymentManagerDeployedContract = await upgrades.deployProxy(ocnPaymentManagerContract, [euroStableCoinDeplyedContract.target]);
  await ocnPaymentManagerDeployedContract.waitForDeployment();
  console.log(`${contractName} deployed at: ${await ocnPaymentManagerDeployedContract.getAddress()}`);

  storeProxyAddress(await ocnPaymentManagerDeployedContract.getAddress(), contractName);
};

export default deployVoteToken;
deployVoteToken.tags = ["all", "payment-deploy"];
