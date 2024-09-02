import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper-functions";
import { getLastProxyAddress } from "../helper/storeJson";
import { networkExtraConfig, developmentChains } from "../helper-hardhat-config";
import { ethers, upgrades } from "hardhat";

const deployVoteToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const contractName = "OcnPaymentManager";
  const { deployer } = await hre.getNamedAccounts();
  const { getNamedAccounts, deployments, network } = hre;
  const { deploy, log } = deployments;

  log("----------------------------------------------------");
  log(`Upgrading ${contractName} at ${network.name} and waiting for confirmations...`);

  // const ocnPaymentManagerDeplyedProxyContract = await ethers.getContract(contractName, deployer);
  // console.log(ocnPaymentManagerDeplyedProxyContract.target);
  const ocnPaymentManagerContract = await ethers.getContractFactory(contractName);
  const ocnPaymentManagerProxy: string = await getLastProxyAddress(contractName);

  const ocnPaymentManagerDeployedContract = await upgrades.upgradeProxy(ocnPaymentManagerProxy, ocnPaymentManagerContract);
  await ocnPaymentManagerDeployedContract.waitForDeployment();
  console.log(`${contractName} deployed to: ${await ocnPaymentManagerDeployedContract.getAddress()}`);

  const deployedContract = await deploy(contractName, {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: networkExtraConfig[network.name].blockConfirmations || 1,
  });
};

export default deployVoteToken;
deployVoteToken.tags = ["all", "payment-upgrade"];
