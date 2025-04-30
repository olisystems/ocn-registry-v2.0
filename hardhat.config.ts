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
import { log } from "console";

//import all tasks
let tasksFolder = "./tasks/";
var normalizedPath = require("path").join(__dirname, tasksFolder);
require("fs")
  .readdirSync(normalizedPath)
  .forEach(function (file: string) {
    require(tasksFolder + file);
  });

// to avoid errors when private keys are not passed as parameters (real deployments)
const randomPk: string = "2d70b3cc7f8d71da4ca2b3a37dbd45d622d6b1bcf79b093ebfb62ecac3b4073d";
const deployerPrivateKey: string = process.env.DEPLOYER_PRIVATE_KEY || randomPk;
const nodePrivateKey = process.env.NODE_PRIVATE_KEY || randomPk;
const cpoPrivateKey = process.env.CPO_PRIVATE_KEY || randomPk;
const emspPrivateKey = process.env.EMSP_PRIVATE_KEY || randomPk;
const cdrAdapterPrivateKey = process.env.CD_ADAPTER_PRIVATE_KEY || randomPk;
const nspPrivateKey = process.env.NSP_PRIVATE_KEY || randomPk;
const billingPrivateKey = process.env.BILLING_PRIVATE_KEY || randomPk;
const etherScanApiKey = process.env.ETHERSCAN_API_KEY || randomPk;
const minikubeHardhatURL = process.env.MINIKUBE_HARDHAT_URL || "http://hardhat.default.svc.cluster.local:8555";

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
  paths: {
    cache: "/data/hardhat/cache",
    artifacts: "/data/hardhat/artifacts",
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

    ganache: {
      url: `http://127.0.0.1:8544`,
      accounts: [deployerPrivateKey, nodePrivateKey, cpoPrivateKey, emspPrivateKey, cdrAdapterPrivateKey, nspPrivateKey, billingPrivateKey],
      chainId: 1337,
    },
    hardhat: {
      accounts: [
        { privateKey: deployerPrivateKey, balance: "10000000000000000000000" }, // example: 10,000 ETH
        { privateKey: nodePrivateKey, balance: "10000000000000000000000" }, // example: 10,000 ETH
        { privateKey: cpoPrivateKey, balance: "10000000000000000000000" }, // example: 10,000 ETH
        { privateKey: emspPrivateKey, balance: "10000000000000000000000" }, // example: 10,000 ETH
        { privateKey: cdrAdapterPrivateKey, balance: "10000000000000000000000" }, // example: 10,000 ETH
        { privateKey: nspPrivateKey, balance: "10000000000000000000000" }, // example: 10,000 ETH
        { privateKey: billingPrivateKey, balance: "10000000000000000000000" }, // example: 10,000 ETH
      ],
      chainId: 31337,
      live: false,
      saveDeployments: true,
    },
    localhost: {
      chainId: 31337,
      live: false,
      saveDeployments: true,
      tags: ["test"],
      accounts: [deployerPrivateKey, nodePrivateKey, cpoPrivateKey, emspPrivateKey, cdrAdapterPrivateKey, nspPrivateKey, billingPrivateKey],
      loggingEnabled: true,
    },
    minikube: {
      url: minikubeHardhatURL,
      chainId: 31337,
      live: false,
      saveDeployments: true,
      accounts: [deployerPrivateKey, nodePrivateKey, cpoPrivateKey, emspPrivateKey, cdrAdapterPrivateKey, nspPrivateKey, billingPrivateKey],
      loggingEnabled: true,
      customChainPaths: ["/data/hardhat/chains"],
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
    nodeOperator: {
      default: 1,
    },
    cpoOperator: {
      default: 2,
    },
    emspOperator: {
      default: 3,
    },
  },
  mocha: {
    timeout: 200000, // 200 seconds max for running tests
  },
};

export default config;
