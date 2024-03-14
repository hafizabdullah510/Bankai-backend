import {
  UNAUTHENTICATED_ERROR,
  BAD_REQUEST_ERROR,
  UNAUTHORIZED_ERROR,
} from "../errors/CustomErrors.js";
import User from "../models/UserModel.js";
import { StatusCodes } from "http-status-codes";
import Card from "../models/CardModel.js";
import BankCard from "../models/BanksCardModel.js";
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
  res.status(StatusCodes.OK).json({ msg: "card added" });
};
export const deleteCard = async (req, res) => {
  const { id } = req.params;
  await Card.findByIdAndDelete(id);
  res.status(StatusCodes.OK).json({ msg: "card deleted" });
};
export const changePriority = async (req, res) => {
  res.status(StatusCodes.OK).json({ msg: "card updated" });
};
export const getAllCards = async (req, res) => {
  const cards = await Card.find({ ownedBy: req.user.userId });
  res.status(StatusCodes.OK).json({ cards });
};
