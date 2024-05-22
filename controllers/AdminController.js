import {
  UNAUTHENTICATED_ERROR,
  BAD_REQUEST_ERROR,
  UNAUTHORIZED_ERROR,
} from "../errors/CustomErrors.js";
import User from "../models/UserModel.js";
import Transaction from "../models/Transaction.js";
import VirtualCard from "../models/VirtualCard.js";
import { StatusCodes } from "http-status-codes";

export const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" });
  const filteredUsers = users.map((user) => user.delPassword());
  res.status(StatusCodes.OK).json({ users: filteredUsers });
};

export const getAllTransactions = async (req, res) => {
  const { month } = req.body;
  const startDate = new Date(month);
  const endDate = new Date(month);

  // Get the start and end of the month
  startDate.setDate(1);
  endDate.setMonth(endDate.getMonth() + 1, 0);

  console.log(startDate, endDate);
  // MongoDB aggregation pipeline to filter transactions based on month
  const transactions = await Transaction.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
      },
    },
  ]);

  res.status(StatusCodes.OK).json({ transactions: transactions });
};

export const getSingleUserTransactions = async (req, res) => {
  const { id } = req.params;
  const { month } = req.body;
  const startDate = new Date(month);
  const endDate = new Date(month);

  // Get the start and end of the month
  startDate.setDate(1);
  endDate.setMonth(endDate.getMonth() + 1, 0);

  console.log(startDate, endDate);
  // MongoDB aggregation pipeline to filter transactions based on month
  const transactions = await Transaction.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        performedBy: id.toString(),
      },
    },
  ]);

  res.status(StatusCodes.OK).json({ transactions: transactions });
};

export const getLoanTakenUsers = async (req, res) => {
  const virtualCards = await VirtualCard.find({ loan_taken: { $gt: 0 } });
  let userWhoTookLoan = [];
  for (let i = 0; i < virtualCards.length; i++) {
    const user = await User.findOne({ _id: virtualCards[i].ownedBy });
    userWhoTookLoan.push(user);
  }
  userWhoTookLoan = userWhoTookLoan.map((user) => user.delPassword());

  res.status(StatusCodes.OK).json({ users: userWhoTookLoan });
};

export const getLoanDefaulters = async (req, res) => {
  const users = await User.find({ credit_score: { $lt: 5 } });
  res.status(StatusCodes.OK).json({ users });
};

export const blockUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate({ _id: id });
  user.isBlocked = true;
  await user.save();

  res.status(StatusCodes.OK).json({ msg: "User has been blocked!" });
};
export const UnBlockUser = async (req, res) => {
  const { id } = req.params;
  const user = await User.findByIdAndUpdate({ _id: id });
  user.isBlocked = false;
  await user.save();

  res.status(StatusCodes.OK).json({ msg: "User has been un-blocked!" });
};
