import dotenv from "dotenv";
dotenv.config();
import { AlchemyProvider, ethers } from "ethers";
import fs from "fs-extra";
export const getContract = async () => {
  const provider = new AlchemyProvider("sepolia", process.env.ALCHEMY_API_KEY);

  const wallet = new ethers.Wallet(process.env.CHAIN_PRIVATE_KEY, provider);
  const contractAddress = await fs.readFile(
    process.cwd() + "/CardDetailsContractAddress.txt",
    "utf-8"
  );
  const abi = await fs.readFile(
    process.cwd() +
      "/contracts/CardDetailsContract_sol_CardDetailsContract.abi",
    "utf-8"
  );
  const cardDetailsContract = new ethers.Contract(contractAddress, abi, wallet);
  return cardDetailsContract;
};
