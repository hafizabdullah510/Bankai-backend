// deploy.js
// imports
import dotenv from "dotenv";
dotenv.config();
import fs from "fs-extra";
import { ethers, AlchemyProvider } from "ethers";

async function deployNew() {
  const provider = new AlchemyProvider("sepolia", process.env.ALCHEMY_API_KEY);
  const privateKey = process.env.PRIVATE_KEY;
  const wallet = new ethers.Wallet(privateKey, provider);
  console.log(wallet);

  const abi = await fs.readFile(
    "contracts/CardDetailsContract_sol_CardDetailsContract.abi",
    "utf-8"
  );
  const binary = await fs.readFile(
    "contracts/CardDetailsContract_sol_CardDetailsContract.bin",
    "utf-8"
  );

  // Deploying Code
  const contractFactory = new ethers.ContractFactory(abi, binary, wallet);
  console.log("deploying please wait");
  const cardDetailsContract = await contractFactory.deploy();
  await cardDetailsContract.waitForDeployment();
  const contractAddress = await cardDetailsContract.getAddress();
  console.log(contractAddress);
  fs.writeFileSync("CardDetailsContractAddress.txt", contractAddress);

  //   await retrieveAllCards(cardDetailsContract);
  //   await retreiveSingleCard(cardDetailsContract, "54665453334");
}

async function getDeployedContract(contractAddress, wallet) {
  // use already deployed contract address
  // const deployedContractAddress = await fs.readFile('../CardDetailsContractAddress.txt',"utf-8")
  const abi = await fs.readFile(
    "contracts/CardDetailsContract_sol_CardDetailsContract.abi",
    "utf-8"
  );
  const cardDetailsContract = new ethers.Contract(contractAddress, abi, wallet);

  // const cardDetailsContract = await ethers.getContractAt("CardDetailsContract",contractAddress)
  console.log(cardDetailsContract);

  // try {
  //   const card = await cardDetailsContract.storeCardDetails(cardNumbers[2],"Abdullah Tariq","4/26")
  //   const cardReceipt = await card.wait()
  //   console.log(cardReceipt)
  //   console.log(card)
  // } catch (error) {
  //   console.log(error.message)
  // }

  const cardIDsBytes32 = cardIDs.map((cardID) =>
    ethers.encodeBytes32String(cardID)
  );
  const cardDetails = await cardDetailsContract.getAllCardDetails(
    cardIDsBytes32
  );
  console.log(cardDetails);
}

// Execute deployment

// async main
async function main(value) {
  const provider = new AlchemyProvider("sepolia", process.env.ALCHEMY_API_KEY);
  const privateKey = process.env.PRIVATE_KEY;
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log("Main executed");
  if (value) {
    console.log("If executed");
    await deployNew();
    // .then(() => console.log("Deployment completed successfully."))
    // .catch(error => console.error("Deployment failed:", error));
  } else {
    console.log("Else executed");
    const contractAddress = await fs.readFile(
      "CardDetailsContractAddress.txt",
      "utf-8"
    );
    await getDeployedContract(contractAddress, wallet);
  }
}

// main
main(true)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
