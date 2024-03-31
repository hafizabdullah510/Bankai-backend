import {
  UNAUTHENTICATED_ERROR,
  BAD_REQUEST_ERROR,
  UNAUTHORIZED_ERROR,
} from "../errors/CustomErrors.js";
import User from "../models/UserModel.js";
import { StatusCodes } from "http-status-codes";
import BankCard from "../models/BanksCardModel.js";
import VirtualCard from "../models/VirtualCard.js";
import { getContract } from "../utils/contracts.js";
import { v4 as uuidv4 } from "uuid";
import { getUserCards } from "../utils/blockFunctions.js";
import { ethers } from "ethers";

export const addCard = async (req, res) => {
  const {
    cardHolderName,
    cardNumber,
    cardHolderCnic,
    cvv,
    issueDate,
    expiryDate,
    bankName,
    cardType,
  } = req.body;

  const user = await User.findOne({ _id: req.user.userId });

  if (!(user.cnic === cardHolderCnic)) {
    throw new UNAUTHORIZED_ERROR("Not Authorized to add card.");
  }

  if (!user.isKycVerified) {
    throw new UNAUTHORIZED_ERROR("Please perform KYC to add card.");
  }

  const cardContact = await getContract();

  const isCardFound = await BankCard.findOne({
    cardHolderCnic,
    bankName,
    cardType,
    cardHolderName,
    cardNumber,
    cvv,
  });
  if (!isCardFound) {
    throw new BAD_REQUEST_ERROR("Please enter a valid card");
  }
  const currentDate = new Date(Date.now());

  if (expiryDate <= currentDate) {
    throw new BAD_REQUEST_ERROR("Please enter a valid card");
  }
  const numberOfCards = user.cards.length;
  const priorityNumber = numberOfCards + 1;

  const cardID = uuidv4().substring(0, 25);

  const card = await cardContact.storeCardDetails({
    cardID,
    cardNumber: cardNumber.toString(),
    cardHolderName,
    cvv: cvv.toString(),
    expiryDate,
  });
  const cardReceipt = await card.wait();
  console.log(cardReceipt);

  user.cards.push({
    cardID,
    issueDate,
    bankName,
    cardHolderCnic,
    cardType,
    isCardFreeze: false,
    ownedBy: req.user.userId,
    priorityNumber,
  });
  await user.save();
  const isVirtualCardCreated = await VirtualCard.findOne({
    ownedBy: req.user.userId,
  });
  if (!isVirtualCardCreated) {
    await VirtualCard.create({
      cardHolderName,
      cardNumber,
      cardHolderCnic,
      cvv: Math.floor(Math.random() * 900) + 100,
      issueDate: new Date(Date.now()),
      expiryDate: currentDate.setFullYear(currentDate.getFullYear() + 5),
      ownedBy: req.user.userId,
    });
  }
  res.status(StatusCodes.OK).json({ msg: "card added" });
};
export const deleteCard = async (req, res) => {
  const { id } = req.params;
  const cardContact = await getContract();
  const deleted = await cardContact.deleteCard(id);
  await deleted.wait();
  const user = await User.findOne({ _id: req.user.userId });

  const cardIndex = user.cards.findIndex((card) => card.cardID === id);

  // Remove the card from the array
  const deletedCard = user.cards.splice(cardIndex, 1)[0];

  // Update priority numbers of remaining cards
  for (const card of user.cards) {
    if (card.priorityNumber > deletedCard.priorityNumber) {
      card.priorityNumber -= 1;
    }
  }

  // Save the updated user document
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "card deleted" });
};
export const changePriority = async (req, res) => {
  const { cards } = req.body;

  const user = await User.findOne({ _id: req.user.userId });
  // Iterate over each card update in the request body
  for (const card of cards) {
    const { cardID, priorityNumber } = card;
    // Find the card in the user's array
    await User.findOneAndUpdate(
      { "cards.cardID": cardID },
      { $set: { "cards.$.priorityNumber": priorityNumber } }
    );
  }
  res.status(StatusCodes.OK).json({ msg: "Priority Updated" });
};
export const getAllCards = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId });

  const combinedArray = await getUserCards(user);

  res.status(StatusCodes.OK).json({ cards: combinedArray });
};

export const renewLimit = async () => {
  const creditCards = await BankCard.find({ cardType: "credit" });
  for (let i = 0; i < creditCards.length; i++) {
    const creditLimit = creditCards[i].credit_limit;
    creditCards[i].available_limit = creditLimit;
    await creditCards[i].save();
  }
  console.log("limit renewed");
};
