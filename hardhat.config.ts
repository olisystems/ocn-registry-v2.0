import "@nomicfoundation/hardhat-toolbox-viem";

import "@nomiclabs/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-abi-exporter";
import "@typechain/hardhat";
import "hardhat-deploy";
import dotenv from "dotenv";
dotenv.config();
import "./tasks/sendStablecoinsToParties";
import "./tasks/propose";

//import all tasks
let tasksFolder = "./tasks/";
var normalizedPath = require("path").join(__dirname, tasksFolder);
require("fs")
  .readdirSync(normalizedPath)
  .forEach(function (file: string) {
    require(tasksFolder + file);
  });

if (!process.env.DEPLOYER_PRIVATE_KEY) {
  throw new Error("DEPLOYER_PRIVATE_KEY must be set in .env file");
}
const rawDeployerPrivateKey = process.env.DEPLOYER_PRIVATE_KEY;
const normalizedDeployerPrivateKey = rawDeployerPrivateKey.startsWith("0x")
  ? rawDeployerPrivateKey
  : `0x${rawDeployerPrivateKey}`;
if (!/^0x[a-fA-F0-9]{64}$/.test(normalizedDeployerPrivateKey)) {
  throw new Error("DEPLOYER_PRIVATE_KEY must be a 32-byte hex private key (0x prefix optional)");
}

const deployerPrivateKey: string = normalizedDeployerPrivateKey;
const etherScanApiKey = process.env.ETHERSCAN_API_KEY || "";

const config = {
  sourcify: {
    enabled: true,
  },
  defaultNetwork: "localhost",
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // Low runs value to reduce contract size
      },
    },
  },
  typechain: {
    outDir: "typechain",
    target: "ethers-v6",
  },
  networks: {
    amoy: {
      // polygon testnet
      url: "https://rpc-amoy.polygon.technology",
      accounts: [deployerPrivateKey],
      chainId: 80002,
    },
    volta: {
      // energy web chain testnet
      url: "https://volta-rpc.energyweb.org",
      accounts: [deployerPrivateKey],
      chainId: 73799,
    },
    chiado: {
      // energy web chain testnet
      url: "https://gnosis-chiado-rpc.publicnode.com",
      accounts: [deployerPrivateKey],
      chainId: 10200,
    },
    gnosis: {
      // Gnosis chain mainnet
      url: "https://rpc.gnosischain.com",
      accounts: [deployerPrivateKey],
      chainId: 100,
    },
    localhost: {
      chainId: 31337,
      live: false,
      saveDeployments: true,
      tags: ["test"],
      loggingEnabled: true,
    },
  },
  abiExporter: {
    path: "./abi",
    runOnCompile: true,
    clear: true,
    flat: true,
    spacing: 2,
    format: "json",
  },
  etherscan: {
    apiKey: etherScanApiKey,
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    // coinmarketcap: COINMARKETCAP_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
    },
  },
  mocha: {
    timeout: 200000, // 200 seconds max for running tests
  },
};

export default config;
