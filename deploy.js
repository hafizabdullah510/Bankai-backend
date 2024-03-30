// deploy.js
// imports
import dotenv from "dotenv";
dotenv.config();
import fs from "fs-extra";
import { ethers, AlchemyProvider } from "ethers";

// Define the cards array with cardID property
const cards = [
  {
    cardID: "54665453333",
    cardNumber: "1234567890123456",
    cardHolderName: "John Doe",
    cvv: "123",
    expiryDate: "01/2026",
  },
  {
    cardID: "54665453334",
    cardNumber: "9876543210987654",
    cardHolderName: "Jane Smith",
    cvv: "456",
    expiryDate: "02/2026",
  },
  {
    cardID: "54665453335",
    cardNumber: "1111222233334444",
    cardHolderName: "Alice Johnson",
    cvv: "789",
    expiryDate: "03/2026",
  },
];

// Map cardIDs from cards array
const cardIDs = cards.map((card) => card.cardID);

async function deployNew() {
  const rpcEndpoint = process.env.RPC_URL;
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

  // Store cards
  for (const card of cards) {
    const { cardID, cardNumber, cardHolderName, cvv, expiryDate } = card;
    const cardParams = {
      cardID,
      cardNumber,
      cardHolderName,
      cvv,
      expiryDate,
    };
    const cardReceipt = await cardDetailsContract.storeCardDetails(cardParams);
    await cardReceipt.wait();
  }

  // Retrieve all cards
  await retrieveAllCards(cardDetailsContract);

  // Delete a card (example)
  await deleteACard(
    cardDetailsContract,
    "65dfe32e-0800-41a0-9988-e5f373c7398d"
  );
  //   await retrieveAllCards(cardDetailsContract);
  //   await retreiveSingleCard(cardDetailsContract, "54665453334");
}

async function retreiveSingleCard(contractAddress, cardID) {
  const card = await contractAddress.retrieveCardDetails(cardID);
  console.log(card);
  return card;
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
  await deleteACard(
    cardDetailsContract,
    "54ac9910-c562-409a-a9a1-c8651430377c"
  );

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

async function deleteACard(cardDetailsContract, cardID) {
  try {
    const deleted = await cardDetailsContract.deleteCard(cardID);
    await deleted.wait();
    console.log("Card", cardID, "deleted:", deleted);
  } catch (error) {
    console.error("Failed to delete card", cardID, ":", error.message);
  }
}

async function retrieveAllCards(cardDetailsContract) {
  console.log("Retrieving all cards...");
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
main(false)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
