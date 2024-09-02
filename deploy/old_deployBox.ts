import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper-functions";
import { networkExtraConfig, developmentChains } from "../helper-hardhat-config";
import { ethers } from "hardhat";

const deployFunction: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment
) {
  const contractName = "Box";
  const { deployer } = await hre.getNamedAccounts();
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;

  log("----------------------------------------------------");
  log(`Deploying ${contractName} at ${network.name} and waiting for confirmations...`);
  const deployedContract = await deploy(contractName, {
    from: deployer,
    args: [deployer],
    log: true,
    waitConfirmations: networkExtraConfig[network.name].blockConfirmations || 1,
  });

  const timelockContract: any = await ethers.getContract("Timelock", deployer);
  const boxContract = await ethers.getContractAt(
    "Box",
    deployedContract.address
  );
  const timeLock = await ethers.getContract("Timelock")
  console.log("Transferring ownership of Box to TimeLock...")
  const transferTx = await boxContract.transferOwnership(await timeLock.getAddress())
  await transferTx.wait(1)
};

export default deployFunction;
deployFunction.tags = ["all", "box"];
