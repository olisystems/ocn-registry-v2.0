
const config = {
  defaultNetwork: "hardhat",

  networks: {
    hardhat: {
      accounts: {
          mnemonic: "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat",
        },
      saveDeployments: true,
      chainId: 31337,
    },
  },
};

export default config;
