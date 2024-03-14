import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();
import Card from "./models/BanksCardModel.js";
try {
  await mongoose.connect(process.env.MONGO_URL);
  await Card.create(
    {
      cardHolderName: "Abdullah Tariq",
      cardNumber: "2222 3333 4444 7777",
      cvv: 798,
      issueDate: new Date(Date.now()),
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1800),
      serviceProvider: "VISA",
      bankName: "UBL",
      cardHolderCnic: "3410415412211",
      cardType: "debit",
      availableBalance: 100000,
    },
    {
      cardHolderName: "Umar Tariq",
      cardNumber: "2222 3333 4444 8888",
      cvv: 124,
      issueDate: new Date(Date.now()),
      expiryDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 1800),
      serviceProvider: "MASTERCARD",
      bankName: "Faysal Bank",
      cardHolderCnic: "3410415316261",
      cardType: "credit",
      credit_limit: 80000,
      available_limit: 80000,
    }
  );

  console.log("Success!!!");
  process.exit(0);
} catch (error) {
  console.log(error);
  process.exit(1);
}
