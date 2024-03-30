//config
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

// import '@nomicfoundation/hardhat-toolbox';
// import dotenv from 'dotenv';

// dotenv.config();

/** @type import('hardhat/config').HardhatUserConfig */

const { SEPOLIA_RPC_URL, API_KEY, PRIVATE_KEY, SEPOLIA_CHAIN_ID } = process.env;

module.exports = {
  solidity: "0.8.7",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [`0x${PRIVATE_KEY}`], // to give private key of our wallet we pass an array of accounts. Because we can have multiple accounts
      // chainId: SEPOLIA_CHAIN_ID, //this causes error in compilation
    },
  },
};
