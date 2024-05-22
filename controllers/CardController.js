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
import { retreiveSingleCard } from "../utils/blockFunctions.js";

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

  if (
    user.kycStatus === "not_initiated" ||
    user.kycStatus === "failed" ||
    user.kycStatus === "pending"
  ) {
    throw new UNAUTHORIZED_ERROR("Please perform KYC to add card.");
  }
  const currentDate = new Date(Date.now());

  if (user.subscription_expiry_Date < currentDate) {
    throw new UNAUTHORIZED_ERROR(
      "Your subscription has expired.Please Renew your subscription"
    );
  }

  const cardContact = await getContract();

  const isCardFound = await BankCard.findOne({
    cardHolderCnic,
    bankName,
    cardType,
    cardNumber,
    cvv,
  });
  if (!isCardFound) {
    throw new BAD_REQUEST_ERROR("Please enter a valid card");
  }

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
    issueDate,
    cardType,
    cardHolderCnic,
    bankName,
  });
  const cardReceipt = await card.wait();
  console.log(cardReceipt);

  user.cards.push({
    cardID,
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
  const user = await User.findOne({ _id: req.user.userId });
  const virtualCard = await VirtualCard.findOne({ ownedBy: req.user.userId });
  const cardBeingDeleted = user.cards.find((card) => card.cardID === id);
  if (virtualCard.loan_taken > 0 && cardBeingDeleted.cardType === "credit") {
    throw new UNAUTHORIZED_ERROR("Card cannot be deleted.");
  }
  const cardContract = await getContract();
  const deleted = await cardContract.deleteCard(id);
  await deleted.wait();

  const cardIndex = user.cards.findIndex((card) => card.cardID === id);

  // Remove the card from the array
  const deletedCard = user.cards.splice(cardIndex, 1)[0];
  console.log(cardIndex, deletedCard);
  // Update priority numbers of remaining cards
  for (const card of user.cards) {
    if (card.priorityNumber > deletedCard.priorityNumber) {
      card.priorityNumber -= 1;
    }
  }

  // Save the updated user document
  user.markModified("cards");
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

export const renewLimit = async (req, res) => {
  const creditCards = await BankCard.find({ cardType: "credit" });
  console.log(creditCards, creditCards.length);
  for (let i = 0; i < creditCards.length; i++) {
    const creditLimit = creditCards[i].credit_limit;
    creditCards[i].available_limit = creditLimit;
    await creditCards[i].save();
  }
  console.log("limit renewed");
  res.status(StatusCodes.OK).json({ msg: "limit renewed" });
};

export const freezeCard = async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: req.user.userId });
  const userVirtualVCard = await VirtualCard.findOne({
    ownedBy: req.user.userId,
  });
  const cardIndex = user.cards.findIndex((card) => card.cardID === id);

  if (
    userVirtualVCard.loan_taken > 0 &&
    user.cards[cardIndex].cardType === "credit"
  ) {
    throw new UNAUTHORIZED_ERROR("Card Cannot be freezed");
  }
  user.cards[cardIndex].isCardFreeze = true;
  user.markModified("cards");
  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Card Freezed" });
};

export const getSingleCard = async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: req.user.userId });

  const card = await retreiveSingleCard(id, user);
  res.status(StatusCodes.OK).json({ card });
};

export const unfreezeCard = async (req, res) => {
  const { id } = req.params;
  const user = await User.findOne({ _id: req.user.userId });
  const cardIndex = user.cards.findIndex((card) => card.cardID === id);
  user.cards[cardIndex].isCardFreeze = false;
  user.markModified("cards");
  await user.save();
  res.status(StatusCodes.OK).json({ msg: "Card Unfreezed" });
};
export const getUserVirtualCard = async (req, res) => {
  const userVirtualCard = await VirtualCard.findOne({
    ownedBy: req.user.userId,
  });
  if (!userVirtualCard) {
    throw new BAD_REQUEST_ERROR("No virtual card for this user.");
  }
  res.status(StatusCodes.OK).json({ userVirtualCard });
};

export const recharge_wallet = async (req, res) => {
  const { recharge_amount, cardNumber, cvv, expiryDate } = req.body;
  const userVirtualCard = await VirtualCard.findOne({
    ownedBy: req.user.userId,
  });
  if (!recharge_amount || !cardNumber || !cvv || !expiryDate) {
    throw new BAD_REQUEST_ERROR("Please provide all the required fields");
  }
  const userBankCard = await BankCard.findOne({
    cardNumber,
    cvv,
  });
  if (!userBankCard) {
    throw new BAD_REQUEST_ERROR("Invalid Card");
  }
  const currentDate = new Date(Date.now());

  if (expiryDate <= currentDate) {
    throw new BAD_REQUEST_ERROR("Please enter a valid card");
  }

  if (
    userBankCard.cardType === "credit" &&
    userBankCard.available_limit >= recharge_amount
  ) {
    userVirtualCard.wallet_amount += recharge_amount;
    userBankCard.available_limit -= recharge_amount;
    await userVirtualCard.save();
    await userBankCard.save();
  } else if (
    userBankCard.cardType === "debit" &&
    userBankCard.availableBalance >= recharge_amount
  ) {
    userVirtualCard.wallet_amount += recharge_amount;
    userBankCard.availableBalance -= recharge_amount;
    await userVirtualCard.save();
    await userBankCard.save();
  } else {
    throw new BAD_REQUEST_ERROR("Wallet recharge failed!.Try again later");
  }

  return res
    .status(StatusCodes.OK)
    .json({ msg: "Wallet recharged successfully!" });
};
