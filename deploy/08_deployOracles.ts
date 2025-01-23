import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deploymentsDefaultDir, deploymentsDestDir, networkExtraConfig } from "../helper-hardhat-config";
import * as ProvidersOracleABI from "../test/oracles/ProvidersOracle.json";
import copyDeployments from "../helper/copyDeploymentsToSrc";

const deployCertificateVerifier: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  let contractName = "EMSPOracle";
  const { deployer } = await hre.getNamedAccounts();
  const { deployments, network } = hre;
  const { deploy, log } = deployments;

  log("----------------------------------------------------");
  log(`Deploying ${contractName} at ${network.name} and waiting for confirmations...`);
  await deploy(contractName, {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: networkExtraConfig[network.name].blockConfirmations || 1,
    contract: {
      abi: ProvidersOracleABI.abi,
      bytecode: ProvidersOracleABI.bytecode,
      deployedBytecode: ProvidersOracleABI.deployedBytecode,
    },
  });

  contractName = "CPOOracle";
  log("----------------------------------------------------");
  log(`Deploying ${contractName} at ${network.name} and waiting for confirmations...`);
  await deploy(contractName, {
    from: deployer,
    args: [],
    log: true,
    waitConfirmations: networkExtraConfig[network.name].blockConfirmations || 1,
    contract: {
      abi: ProvidersOracleABI.abi,
      bytecode: ProvidersOracleABI.bytecode,
      deployedBytecode: ProvidersOracleABI.deployedBytecode,
    },
  });

  log("Copying deployments to src...");
  copyDeployments(deploymentsDefaultDir, deploymentsDestDir);
};

export default deployCertificateVerifier;
deployCertificateVerifier.tags = ["all", "oracles"];
