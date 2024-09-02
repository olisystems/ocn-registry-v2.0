import type { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";
import "hardhat-deploy";
import "@nomiclabs/hardhat-ethers";
import "@openzeppelin/hardhat-upgrades";
import "hardhat-abi-exporter";
import dotenv from "dotenv";
dotenv.config();

const walletPrivateKey: string = process.env.WALLET_PRIVATE_KEY || "";
const etherScanApiKey = process.env.ETHERSCAN_API_KEY || "";

const config = {
  sourcify: {
    enabled: true,
  },
  defaultNetwork: "hardhat",
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200, // Low runs value to reduce contract size
      },
    },
  },
  networks: {
    amoy: {
      // polygon testnet
      url: "https://rpc-amoy.polygon.technology",
      accounts: [walletPrivateKey],
      chainId: 80002,
    },
    volta: {
      // energy web chain testnet
      url: "https://volta-rpc.energyweb.org",
      accounts: [walletPrivateKey],
      chainId: 73799,
    },
    ganache: {
      url: `http://127.0.0.1:8544`,
      accounts: [walletPrivateKey],
      chainId: 1337,
    },
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      chainId: 31337,
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
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
  },
  mocha: {
    timeout: 200000, // 200 seconds max for running tests
  },
};

export default config;
