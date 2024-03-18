import {
  UNAUTHENTICATED_ERROR,
  BAD_REQUEST_ERROR,
  UNAUTHORIZED_ERROR,
} from "../errors/CustomErrors.js";
import User from "../models/UserModel.js";
import { StatusCodes } from "http-status-codes";
import Card from "../models/CardModel.js";
import BankCard from "../models/BanksCardModel.js";
import VirtualCard from "../models/VirtualCard.js";
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
  const numberOfCards = await Card.countDocuments({ ownedBy: req.user.userId });
  req.body.priorityNumber = numberOfCards + 1;
  req.body.ownedBy = req.user.userId;
  await Card.create(req.body);
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
  const card = await Card.findOne({ _id: id });
  await Card.updateMany(
    { ownedBy: req.user.userId, priorityNumber: { $gt: card.priorityNumber } },
    { $inc: { priorityNumber: -1 } }
  );
  await Card.findByIdAndDelete(id);
  res.status(StatusCodes.OK).json({ msg: "card deleted" });
};
export const changePriority = async (req, res) => {
  const { id } = req.params;
  const { priorityNumber } = req.body;
  const card1 = await Card.findOne({
    ownedBy: req.user.userId,
    priorityNumber,
  });

  const card2 = await Card.findOne({ ownedBy: req.user.userId, _id: id });
  const card2_previousNumber = card2.priorityNumber;
  if (card1 && card2) {
    card2.priorityNumber = card1.priorityNumber;
    card1.priorityNumber = card2_previousNumber;
    await card2.save();
    await card1.save();
  }
  res.status(StatusCodes.OK).json({ msg: "Priority Updated" });
};
export const getAllCards = async (req, res) => {
  const cards = await Card.find({ ownedBy: req.user.userId });
  res.status(StatusCodes.OK).json({ cards });
};
