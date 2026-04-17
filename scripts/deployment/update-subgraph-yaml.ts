import fs from "fs";
import path from "path";
import YAML from "yaml";

type DeploymentData = {
  address: string;
  blockNumber: number;
};

function fail(message: string): never {
  throw new Error(message);
}

function readDeployment(
  repoRoot: string,
  network: string,
  deploymentName: string,
): DeploymentData | null {
  const filePath = path.join(repoRoot, "deployments", network, `${deploymentName}.json`);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw) as {
    address?: string;
    receipt?: { blockNumber?: number | string };
  };

  if (!parsed.address) {
    fail(`Deployment "${deploymentName}" exists but has no address.`);
  }

  const blockNumber = Number(parsed.receipt?.blockNumber ?? 0);
  return {
    address: parsed.address,
    blockNumber: Number.isFinite(blockNumber) ? blockNumber : 0,
  };
}

type DataSource = {
  name?: string;
  network?: string;
  source?: {
    address?: string;
    startBlock?: number;
  };
};

type SubgraphManifest = {
  dataSources?: DataSource[];
};

function updateDataSource(
  manifest: SubgraphManifest,
  dataSourceName: string,
  manifestName: string,
  values: { network: string; address: string; startBlock: number },
): void {
  const dataSource = manifest.dataSources?.find((item) => item.name === dataSourceName);
  if (!dataSource) {
    fail(`Datasource "${dataSourceName}" not found in ${manifestName}.`);
  }

  dataSource.network = values.network;
  if (!dataSource.source) {
    dataSource.source = {};
  }
  dataSource.source.address = values.address;
  dataSource.source.startBlock = values.startBlock;
}

function main(): void {
  const [, , networkArg, stablecoinOverrideArg, manifestPathArg] = process.argv;
  if (!networkArg) {
    fail(
      "Usage: ts-node scripts/deployment/update-subgraph-yaml.ts <network> [stablecoin-address] [manifest-path]",
    );
  }

  const repoRoot = path.resolve(__dirname, "../..");
  const subgraphManifestPath =
    manifestPathArg || process.env.SUBGRAPH_MANIFEST || "thegraph-indexer/ocn-registry-oli/subgraph.yaml";
  const subgraphYamlPath = path.isAbsolute(subgraphManifestPath)
    ? subgraphManifestPath
    : path.join(repoRoot, subgraphManifestPath);
  const subgraphManifestName = path.basename(subgraphYamlPath);

  if (!fs.existsSync(subgraphYamlPath)) {
    fail(`${subgraphManifestName} not found at ${subgraphYamlPath}`);
  }

  const registry = readDeployment(repoRoot, networkArg, "OcnRegistry");
  const paymentManager = readDeployment(repoRoot, networkArg, "OcnPaymentManager");
  const governor = readDeployment(repoRoot, networkArg, "OcnGovernor");
  const certificateVerifier = readDeployment(repoRoot, networkArg, "CertificateVerifier");
  const mockErc20 = readDeployment(repoRoot, networkArg, "MockERC20");
  const euroStable = readDeployment(repoRoot, networkArg, "EuroStableCoin");

  if (!registry) fail(`Missing deployment file for OcnRegistry on network "${networkArg}".`);
  if (!paymentManager) fail(`Missing deployment file for OcnPaymentManager on network "${networkArg}".`);
  if (!governor) fail(`Missing deployment file for OcnGovernor on network "${networkArg}".`);
  if (!certificateVerifier) fail(`Missing deployment file for CertificateVerifier on network "${networkArg}".`);

  const stablecoinAddress =
    stablecoinOverrideArg || mockErc20?.address || euroStable?.address || "";
  if (!stablecoinAddress) {
    fail(
      `Missing stablecoin source for network "${networkArg}". Pass stablecoin address as third argument or deploy MockERC20/EuroStableCoin.`,
    );
  }

  const fallbackStartBlock =
    [registry.blockNumber, paymentManager.blockNumber, governor.blockNumber].filter((n) => n > 0).sort((a, b) => a - b)[0] || 0;

  if (fallbackStartBlock <= 0) {
    fail(`Unable to determine startBlock from deployment receipts for "${networkArg}".`);
  }

  const yamlOriginal = fs.readFileSync(subgraphYamlPath, "utf8");
  const manifest = YAML.parse(yamlOriginal) as SubgraphManifest;
  if (!manifest?.dataSources || !Array.isArray(manifest.dataSources)) {
    fail(`Invalid ${subgraphManifestName} format: dataSources array not found.`);
  }

  updateDataSource(manifest, "OCN_Registry_OLI", subgraphManifestName, {
    network: networkArg,
    address: registry.address,
    startBlock: registry.blockNumber || fallbackStartBlock,
  });
  updateDataSource(manifest, "ERC1967Proxy", subgraphManifestName, {
    network: networkArg,
    address: paymentManager.address,
    startBlock: paymentManager.blockNumber || fallbackStartBlock,
  });
  updateDataSource(manifest, "EuroStableCoin", subgraphManifestName, {
    network: networkArg,
    address: stablecoinAddress,
    startBlock: mockErc20?.blockNumber || euroStable?.blockNumber || paymentManager.blockNumber || fallbackStartBlock,
  });
  updateDataSource(manifest, "OCNGovernor", subgraphManifestName, {
    network: networkArg,
    address: governor.address,
    startBlock: governor.blockNumber || fallbackStartBlock,
  });
  updateDataSource(manifest, "OCN_Certificate_Verifier", subgraphManifestName, {
    network: networkArg,
    address: certificateVerifier.address,
    startBlock: certificateVerifier.blockNumber || fallbackStartBlock,
  });

  const yamlUpdated = YAML.stringify(manifest, { lineWidth: 0 });
  fs.writeFileSync(subgraphYamlPath, yamlUpdated, "utf8");

  console.log(`Updated ${subgraphManifestName} with latest deployment values:`);
  console.log(`- network: ${networkArg}`);
  console.log(`- OCN_Registry_OLI: ${registry.address}`);
  console.log(`- ERC1967Proxy: ${paymentManager.address}`);
  console.log(`- EuroStableCoin: ${stablecoinAddress}`);
  console.log(`- OCNGovernor: ${governor.address}`);
  console.log(`- OCN_Certificate_Verifier: ${certificateVerifier.address}`);
}

main();
