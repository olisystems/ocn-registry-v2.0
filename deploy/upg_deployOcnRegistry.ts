import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { storeProxyAddress, getLastProxyAddress } from "../helper/storeJson";
import verify from "../helper-functions";
import { networkExtraConfig, developmentChains } from "../helper-hardhat-config";
import { ethers, upgrades } from "hardhat";

const deployVoteToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const contractName = "OcnRegistry";
  const { deployer } = await hre.getNamedAccounts();
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;

  log("----------------------------------------------------");
  log(`Deploying ${contractName} at ${network.name} and waiting for confirmations...`);
  const ocnPaymentProxyAddress = await getLastProxyAddress("OcnPaymentManager");
  const ocnRegistryContract = await ethers.getContractFactory(contractName);
  const ocnRegistryDeployedContract = await upgrades.deployProxy(ocnRegistryContract, [ocnPaymentProxyAddress]);
  await ocnRegistryDeployedContract.waitForDeployment();
  console.log(`${contractName} deployed to: ${await ocnRegistryDeployedContract.getAddress()}`);

  storeProxyAddress(await ocnRegistryDeployedContract.getAddress(), contractName);
  console.log(`Transferring ownership of ${contractName} to TimeLock...`);
  const timelockContract: any = await ethers.getContract("Timelock", deployer);
  const transferTx = await ocnRegistryDeployedContract.transferOwnership(await timelockContract.getAddress());
  await transferTx.wait(1);
};

export default deployVoteToken;
deployVoteToken.tags = ["all", "registry-deploy"];
