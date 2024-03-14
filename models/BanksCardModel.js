import mongoose from "mongoose";
const bankCardSchema = new mongoose.Schema({
  cardHolderName: String,
  cardNumber: Number,
  cvv: Number,
  issueDate: Date,
  expiryDate: Date,
  serviceProvider: String,
  bankName: String,
  cardHolderCnic: String,
  cardType: {
    type: String,
    enum: ["debit", "credit"],
    default: "debit",
  },
  availableBalance: Number,
  credit_limit: Number,
  available_limit: Number,
});

export default mongoose.model("usercards", bankCardSchema);
