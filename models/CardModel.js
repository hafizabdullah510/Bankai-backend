import mongoose from "mongoose";
const cardSchema = new mongoose.Schema({
  cardHolderName: String,
  cardNumber: Number,
  cvv: Number,
  issueDate: Date,
  expiryDate: Date,
  bankName: String,
  cardHolderCnic: String,
  cardType: {
    type: String,
    enum: ["debit", "credit"],
    default: "debit",
  },
  isCardFreeze: {
    type: Boolean,
    default: false,
  },
  ownedBy: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  priorityNumber: Number,
});

export default mongoose.model("card", cardSchema);
