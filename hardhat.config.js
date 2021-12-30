require("@nomiclabs/hardhat-waffle");
require('dotenv').config();
require('./scripts/hardhat.tasks.js');

const {
    ARB_ONE_URL,
    ARB_RINKEBY_URL,
    DEV_PRIVATE_KEY,
    TEST_MNEMONIC
} = process.env;

if (!TEST_MNEMONIC) {
    throw new Error('TEST_MNEMONIC needs to be set in `.env`');
}

module.exports = {
    defaultNetwork: "hardhat",
    networks: {
        hardhat: {
            // loggingEnabled: true,
            // accounts: [{privateKey: DEV_PRIVATE_KEY, balance: '1000000000000000000000'}]
        },
        // arbRinkeby: {
        //     accounts: [DEV_PRIVATE_KEY],
        //     url: ARB_RINKEBY_URL || 'https://rinkeby.arbitrum.io/rpc',
        // },
        // arbOne: {
        //     accounts: [DEV_PRIVATE_KEY],
        //     url: ARB_ONE_URL || 'https://arbitrum.io/rpc',
        // }
    },
    paths: {
        sources: "./contracts",
        cache: "./build/cache",
        artifacts: "./build/artifacts",
        tests: "./test",
    },
    solidity: {
        compilers: [
            {
                version: "0.6.11"
            },
            {
                version: "0.8.10",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 1000000,
                    }
                }
            },
        ],
        overrides: {
            "contracts/Bundler.yul": {
                version: "0.8.10",
                settings: {
                    // optimizer: {
                    //     enabled: true,
                    //     runs: 1000000,
                    // }
                }
            },
            "contracts/BundlerV2.yul": {
                version: "0.8.10",
                settings: {}
            }
        },
    }
};
