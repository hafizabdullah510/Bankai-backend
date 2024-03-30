import {
  UNAUTHENTICATED_ERROR,
  BAD_REQUEST_ERROR,
  UNAUTHORIZED_ERROR,
} from "../errors/CustomErrors.js";
import { StatusCodes } from "http-status-codes";
import Transaction from "../models/Transaction.js";
import Card from "../models/CardModel.js";
import BanksCard from "../models/BanksCardModel.js";
import VirtualCard from "../models/VirtualCard.js";
import User from "../models/UserModel.js";

export const performTransaction = async (req, res) => {
  const { cardNumber, cvv, amount, merchant } = req.body;
  const virtualCard = await VirtualCard.findOne({ cardNumber, cvv });
  if (!virtualCard) {
    throw new UNAUTHORIZED_ERROR("Not Authorized to perform transaction");
  }
  const singleUser = await User.findOne({ _id: virtualCard.ownedBy });
  const user = singleUser.delPassword();

  const userCreditCards = await Card.find({
    ownedBy: user._id,
    cardType: "credit",
  }).sort({
    priorityNumber: 1,
  });
  const userDebitCards = await Card.find({
    ownedBy: user._id,
    cardType: "debit",
  }).sort({
    priorityNumber: 1,
  });
  let transactionCompleted = false;

  Promise.all([userCreditCards, userDebitCards])
    .then(async ([userCreditCards, userDebitCards]) => {
      const allCards = [...userCreditCards, ...userDebitCards];
      for (let i = 0; i < allCards.length; i++) {
        const card = allCards[i];
        const userBankCard = await BanksCard.findOne({
          cardNumber: card.cardNumber,
        });
        if (
          userBankCard.cardType === "credit" &&
          amount <= userBankCard.available_limit
        ) {
          console.log("it credit");
          transactionCompleted = true;
          userBankCard.available_limit -= amount;
          await userBankCard.save();
          await Transaction.create({
            amount,
            merchant,
            transaction_card: card._id,
            transaction_virtual_card: null,
          });
          break;
        }
        if (!transactionCompleted) {
          if (
            userBankCard.cardType === "debit" &&
            amount <= userBankCard.availableBalance
          ) {
            console.log("debit");
            transactionCompleted = true;
            userBankCard.availableBalance -= amount;
            await userBankCard.save();
            await Transaction.create({
              amount,
              merchant,
              transaction_card: card._id,
              transaction_virtual_card: null,
            });

            break;
          }
        }
      }
      if (!transactionCompleted) {
        const hasCreditCard = await Card.findOne({
          ownedBy: user._id,
          cardType: "credit",
        });
        if (user.isPremiumUser && hasCreditCard) {
          if (amount <= virtualCard.available_limit) {
            console.log("virtual");
            virtualCard.available_limit -= amount;
            transactionCompleted = true;
            await virtualCard.save();
            await Transaction.create({
              amount,
              merchant,
              transaction_card: null,
              transaction_virtual_card: virtualCard._id,
              isVirtualCardUsed: true,
            });
          } else {
            return res
              .status(StatusCodes.BAD_REQUEST)
              .json({ msg: "transaction failed" });
          }
        }
      }
    })
    .catch((err) => console.log(err));

  res.status(StatusCodes.OK).json({ msg: "Transaction Performed" });
};
