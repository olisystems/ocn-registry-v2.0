import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import verify from "../helper/verify";
import { deploymentsDefaultDir, deploymentsDestDir, DEFAULT_YEARLY_AMOUNT, ADDRESS_ZERO } from "../helper-hardhat-config";
import { artifacts, ethers } from "hardhat";
import copyDeployments from "../helper/copyDeploymentsToSrc";

const deployVoteToken: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const contractName = "OcnPaymentManager";
  const { deployer } = await hre.getNamedAccounts();
  const { getNamedAccounts, deployments, network, upgrades } = hre;
  const { deploy, log, save } = deployments;

  log("----------------------------------------------------");
  log(`Deploying ${contractName} at ${network.name} and waiting for confirmations...`);
  const stablecoinAddressFromEnv = process.env.STABLECOIN_ADDRESS || "";
  const stablecoinDeploymentName = process.env.STABLECOIN_DEPLOYMENT_NAME || "EuroStableCoin";
  let stablecoinAddress: string;

  if (stablecoinAddressFromEnv !== "") {
    stablecoinAddress = stablecoinAddressFromEnv;
    if (!ethers.isAddress(stablecoinAddress)) {
      throw new Error(
        `Invalid STABLECOIN_ADDRESS: "${stablecoinAddress}". Expected a valid 0x... Ethereum address.`,
      );
    }
    log(`Using stablecoin address from STABLECOIN_ADDRESS: ${stablecoinAddress}`);
  } else {
    const deployedStablecoinContract = await ethers.getContract(stablecoinDeploymentName, deployer);
    stablecoinAddress = await deployedStablecoinContract.getAddress();
    log(`Using deployed stablecoin "${stablecoinDeploymentName}" at ${stablecoinAddress}`);
  }

  const defaultOperator = process.env.DEFAULT_OPERATOR || ADDRESS_ZERO;

  const OcnPaymentManager = await ethers.getContractFactory(contractName);
  const deployedContract = await upgrades.deployProxy(OcnPaymentManager, [stablecoinAddress, DEFAULT_YEARLY_AMOUNT, defaultOperator]);
  await deployedContract.waitForDeployment();

  await save(contractName, {
    address: await deployedContract.getAddress(),
    abi: artifacts.readArtifactSync(contractName).abi,
  });

  log("Copying deployments to src...");
  copyDeployments(deploymentsDefaultDir, deploymentsDestDir);

  const timelockContract: any = await ethers.getContract("Timelock", deployer);
  log(`Transferring ownership of ${contractName} to TimeLock at ${timelockContract.target}...`);
  const transferTx = await deployedContract.transferOwnership(timelockContract.target);
  await transferTx.wait(1);
};

export default deployVoteToken;
deployVoteToken.tags = ["all", "payment"];
