import {
  UNAUTHENTICATED_ERROR,
  BAD_REQUEST_ERROR,
  UNAUTHORIZED_ERROR,
} from "../errors/CustomErrors.js";
import { StatusCodes } from "http-status-codes";
import Transaction from "../models/Transaction.js";
import BanksCard from "../models/BanksCardModel.js";
import VirtualCard from "../models/VirtualCard.js";
import User from "../models/UserModel.js";
import { getUserCards, retreiveSingleCard } from "../utils/blockFunctions.js";

export const performTransaction = async (req, res) => {
  const { cardNumber, cvv, amount, merchant } = req.body;
  const virtualCard = await VirtualCard.findOne({ cardNumber, cvv });
  if (!virtualCard) {
    throw new UNAUTHORIZED_ERROR("Not Authorized to perform transaction");
  }
  const singleUser = await User.findOne({ _id: virtualCard.ownedBy });
  const user = singleUser.delPassword();

  const currentDate = new Date(Date.now());

  if (user.subscription_expiry_Date < currentDate) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "transaction failed" });
  }

  if (user.isBlocked) {
    return res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ msg: "transaction failed" });
  }
  let transactionCompleted = false;

  if (amount <= virtualCard.wallet_amount) {
    console.log("Its wallet");
    transactionCompleted = true;
    virtualCard.wallet_amount -= amount;
    await virtualCard.save();
    await Transaction.create({
      amount,
      merchant,
      transaction_card: null,
      performedBy: virtualCard.ownedBy,
      transaction_virtual_card: virtualCard._id,
      isVirtualCardUsed: true,
    });
  }

  const cardsArray = await getUserCards(user);
  for (let i = 0; i < cardsArray.length; i++) {
    const card = cardsArray[i];
    const userBankCard = await BanksCard.findOne({
      cardNumber: card.cardNumber,
    });
    if (
      !card.isCardFreeze &&
      !transactionCompleted &&
      card.cardType === "credit" &&
      amount <= userBankCard.available_limit
    ) {
      console.log("it credit");
      transactionCompleted = true;
      userBankCard.available_limit -= amount;
      await userBankCard.save();
      await Transaction.create({
        amount,
        merchant,
        transaction_card: card.cardID,
        performedBy: card.ownedBy,
        transaction_virtual_card: null,
      });
      break;
    }
    if (!transactionCompleted) {
      if (
        !card.isCardFreeze &&
        card.cardType === "debit" &&
        amount <= userBankCard.availableBalance
      ) {
        console.log("debit");
        transactionCompleted = true;
        userBankCard.availableBalance -= amount;
        await userBankCard.save();
        await Transaction.create({
          amount,
          merchant,
          performedBy: card.ownedBy,
          transaction_card: card.cardID,
          transaction_virtual_card: null,
        });

        break;
      }
    }
  }
  if (!transactionCompleted) {
    const hasCreditCard = cardsArray.find((card) => card.cardType === "credit");
    if (user.credit_score === 5 && user.isPremiumUser && hasCreditCard) {
      if (amount <= virtualCard.available_limit) {
        console.log("virtual");
        virtualCard.available_limit -= amount;
        virtualCard.loan_taken += amount;
        transactionCompleted = true;
        await virtualCard.save();
        await Transaction.create({
          amount,
          merchant,
          transaction_card: null,
          performedBy: virtualCard.ownedBy,
          transaction_virtual_card: virtualCard._id,
          isVirtualCardUsed: true,
        });
      } else {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ msg: "transaction failed" });
      }
    } else {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ msg: "transaction failed due to less credit score." });
    }
  }
  res.status(StatusCodes.OK).json({ msg: "Transaction Performed" });
};

export const getAllTransactions = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId });
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
        performedBy: user._id.toString(),
      },
    },
  ]);

  res.status(StatusCodes.OK).json({ transactions: transactions });
};

export const getSingleTransaction = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId });
  const { id } = req.params;
  const transaction = await Transaction.findOne({ _id: id });
  if (!transaction) {
    throw new Error(`No transaction with Id : ${id}`);
  }
  let transactionCard = {};
  if (transaction.isVirtualCardUsed) {
    transactionCard = await VirtualCard.findOne({
      _id: transaction.transaction_virtual_card,
    });
  } else {
    transactionCard = await retreiveSingleCard(
      transaction.transaction_card,
      user
    );
  }
  let transactionObject = {
    ...transaction._doc,
    ...transactionCard,
  };

  res.status(StatusCodes.OK).json({ ...transactionObject });
};

export const getSingleCardTransactions = async (req, res) => {
  const { id } = req.params;
  const { month } = req.body;
  const startDate = new Date(month);
  const endDate = new Date(month);

  // Get the start and end of the month
  startDate.setDate(1);
  endDate.setMonth(endDate.getMonth() + 1, 0);
  const transactions = await Transaction.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        transaction_card: id,
      },
    },
  ]);
  res.status(StatusCodes.OK).json({ transactions });
};

export const payLoan = async (req, res) => {
  const virtualCards = await VirtualCard.find({ loan_taken: { $gt: 0 } });
  let loanPaid = false;
  for (let i = 0; i < virtualCards.length; i++) {
    const card = virtualCards[i];
    const user = await User.findOne({ _id: card.ownedBy });
    const userCards = await getUserCards(user);
    for (let i = 0; i < userCards.length; i++) {
      const userCardToPayLoan = await BanksCard.findOne({
        cardNumber: userCards[i].cardNumber,
        cardType: "credit",
        available_limit: { $gte: card.loan_taken },
      });
      if (userCardToPayLoan) {
        userCardToPayLoan.available_limit -= card.loan_taken;
        loanPaid = true;
        await userCardToPayLoan.save();
        user.credit_score = 5;
        await user.save();
        await Transaction.create({
          amount: card.loan_taken,
          merchant: "Virtual card payment",
          transaction_card: userCards[i].cardID,
          transaction_virtual_card: card._id,
        });
        await VirtualCard.findOneAndUpdate({ ownedBy: user._id }, [
          { $set: { loan_taken: 0 } },
          { $set: { temp_available_limit: "$max_credit_limit" } },
          { $set: { available_limit: "$temp_available_limit" } },
          { $unset: "temp_available_limit" },
        ]);
        break;
      }
    }
    if (!loanPaid) {
      user.credit_score = 4;
      await user.save();
    }
  }

  res.status(StatusCodes.OK).json({ msg: "Done" });
};
