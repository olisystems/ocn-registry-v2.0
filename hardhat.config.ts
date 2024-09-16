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

const deployerPrivateKey: string = process.env.DEPLOYER_PRIVATE_KEY || "";
const nodePrivateKey = process.env.NODE_PRIVATE_KEY || "";
const cpoPrivateKey = process.env.CPO_PRIVATE_KEY || "";
const emspPrivateKey = process.env.EMSP_PRIVATE_KEY || "";
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
    ganache: {
      url: `http://127.0.0.1:8544`,
      accounts: [deployerPrivateKey, nodePrivateKey, cpoPrivateKey, emspPrivateKey],
      chainId: 1337,
    },
    hardhat: {
      accounts: [
        { privateKey: deployerPrivateKey, balance: "10000000000000000000000" }, // example: 10,000 ETH
        { privateKey: nodePrivateKey, balance: "10000000000000000000000" }, // example: 10,000 ETH
        { privateKey: cpoPrivateKey, balance: "10000000000000000000000" }, // example: 10,000 ETH
        { privateKey: emspPrivateKey, balance: "10000000000000000000000" }, // example: 10,000 ETH
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
      accounts: [deployerPrivateKey, nodePrivateKey, cpoPrivateKey, emspPrivateKey],
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
