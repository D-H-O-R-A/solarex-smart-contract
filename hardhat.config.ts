require("@matterlabs/hardhat-zksync-deploy");
require("@matterlabs/hardhat-zksync-solc");
require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-ethers");

module.exports = {
  // hardhat-zksync-solc
  // The compiler configuration for 'zk' artifacts.
  zksolc: {
    version: '1.3.7',
    compilerSource: 'binary',
    settings: {
        isSystem: true,
        optimizer: {
            enabled: true,
            runs: 9999999
        },
    },
  },

  // hardhat-zksync-deploy
  // Run `deploy-zksync` task to deploy 'zk' artifacts into following network.
  // Note that it will use `artifacts` and `cache` instead of the one with -zk suffix!
  zkSyncDeploy: {
    zkSyncNetwork: "https://mainnet.era.zksync.io",
    ethNetwork: "goerli",
  },

  // The compiler configuration for 'normal' artifacts.
  solidity: {
    version: "0.5.17",
    settings: {
      optimizer: {
        enabled: true,
        runs: 9999999
      }
    }
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  },

  // tests
  defaultNetwork: 'hardhat',
  networks: {
    // Run compile task with this network to generate 'normal' artifacts/cache.
    // For example `yarn hardhat compile --network hardhat`
    hardhat: {
      chainId: 324,
    },

    goerli: {
      url: "https://goerli.infura.io/v3/552a26995b744f66924a9f9aacdb559b", // URL of the Ethereum Web3 RPC (optional)
      zksync: false
    },

    mainnet: {
      url: "https://mainnet.infura.io/v3/552a26995b744f66924a9f9aacdb559b",
      zksync: false
    },

    // Run compile task with this network to generate 'zk' artifacts/cache (with -zk suffix).
    // For example `yarn hardhat compile --network zksync`
    zksync: {
      zksync: true,
      url: 'https://mainnet.era.zksync.io',
      ethNetwork: "mainnet",
      deploy: true,
      chainId: 324,
    },
  },
  plugins: ["@matterlabs/hardhat-zksync-deploy"],
  mocha: {
    timeout: 40000
  },
};

/* zkSync era Testnet

Successful deploy from all contracts!

Factory: 0xa6fFDD9c7108118C768BC337Bc57fF6448FA23bD
Router: 0xb3E7452d1f22543541e94f82457C4CDB4b0110Ad
*/