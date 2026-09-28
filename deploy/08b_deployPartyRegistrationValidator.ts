import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deploymentsDefaultDir, deploymentsDestDir, networkExtraConfig } from "../helper-hardhat-config";
import { ethers } from "hardhat";
import copyDeployments from "../helper/copyDeploymentsToSrc";

const deployPartyRegistrationValidator: DeployFunction = async function (
  hre: HardhatRuntimeEnvironment,
) {
  const contractName = "PartyRegistrationValidator";
  const { deployer } = await hre.getNamedAccounts();
  const { deployments, network } = hre;
  const { deploy, log } = deployments;

  log("----------------------------------------------------");
  log(`Deploying ${contractName} at ${network.name} and waiting for confirmations...`);
  const certificateVerifier = await ethers.getContract("CertificateVerifier", deployer);

  await deploy(contractName, {
    from: deployer,
    args: [certificateVerifier.target],
    log: true,
    waitConfirmations: networkExtraConfig[network.name].blockConfirmations || 1,
  });

  log("Copying deployments to src...");
  copyDeployments(deploymentsDefaultDir, deploymentsDestDir);
};

export default deployPartyRegistrationValidator;
deployPartyRegistrationValidator.tags = ["all", "partyregistrationvalidator"];
