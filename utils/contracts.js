import dotenv from "dotenv";
dotenv.config();
import { AlchemyProvider, ethers } from "ethers";
import fs from "fs-extra";

export const getContract = async (abiPath, addressPath) => {
  console.log(process.cwd());
  const provider = new AlchemyProvider("sepolia", process.env.ALCHEMY_API_KEY);
  const privateKey =
    "88651019206dfec02cd69d39a5a4838bb41b1c43de91fedc02e8b85796e0bfda";

  const wallet = new ethers.Wallet(privateKey, provider);
  const contractAddress = await fs.readFile(
    "CardDetailsContractAddress.txt",
    "utf-8"
  );
  const abi = await fs.readFile(
    "contracts/CardDetailsContract_sol_CardDetailsContract.abi",
    "utf-8"
  );
  const cardDetailsContract = new ethers.Contract(contractAddress, abi, wallet);
  return cardDetailsContract;
};
