import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { ADDRESS_ZERO } from "../helper-hardhat-config";
// @ts-ignore
import { ethers } from "hardhat";

const deployTimelock: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // @ts-ignore
  const { getNamedAccounts, deployments, network } = hre;
  const { log, deploy, get } = deployments;
  const { deployer } = await getNamedAccounts();

  const timelock: any = await ethers.getContract("Timelock", deployer);
  const governor: any = await ethers.getContract("OcnGovernor", deployer);

  log("----------------------------------------------------");
  log(`Setting up contracts for roles at ${network.name}...`);

  const proposerRole = await timelock.PROPOSER_ROLE();
  const executorRole = await timelock.EXECUTOR_ROLE();
  const defaultAdminRole = await timelock.DEFAULT_ADMIN_ROLE();

  // const proposerRole = ethers.id("PROPOSER_ROLE");
  // const executorRole = ethers.id("EXECUTOR_ROLE");
  // const defaultAdminRole = ethers.id("DEFAULT_ADMIN_ROLE");

  log(await timelock.getAddress());
  const proposerTx = await timelock.grantRole(proposerRole, await governor.getAddress());
  await proposerTx.wait(1);
  const executorTx = await timelock.grantRole(executorRole, ADDRESS_ZERO);
  await executorTx.wait(1);
  const revokeTx = await timelock.revokeRole(defaultAdminRole, deployer);
  await revokeTx.wait(1);
};

export default deployTimelock;
deployTimelock.tags = ["all", "setup"];
