import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper-functions";
import { networkExtraConfig, developmentChains } from "../helper-hardhat-config";
import { ethers } from "hardhat";

const deployVoteToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const contractName = "OcnPaymentManager";
  const { deployer } = await hre.getNamedAccounts();
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;

  log("----------------------------------------------------");
  log(`Deploying ${contractName} at ${network.name} and waiting for confirmations...`);
  const euroStableCoinDeplyedContract = await ethers.getContract("EuroStableCoin", deployer);
  await deploy(contractName, {
    from: deployer,
    args: [euroStableCoinDeplyedContract.target],
    log: true,
    waitConfirmations: networkExtraConfig[network.name].blockConfirmations || 1,
  });

  console.log(`Transferring ownership of ${contractName} to TimeLock...`);
  const timelockContract: any = await ethers.getContract("Timelock", deployer);
  const deployedContract: any = await ethers.getContract(contractName, deployer);
  const transferTx = await deployedContract.transferOwnership(await timelockContract.getAddress());
  await transferTx.wait(1);
};

export default deployVoteToken;
deployVoteToken.tags = ["all", "payment"];
