import mongoose from "mongoose";
const virtualCardSchema = new mongoose.Schema({
  cardHolderName: String,
  cardNumber: Number,
  cvv: Number,
  issueDate: Date,
  expiryDate: Date,
  cardHolderCnic: String,
  max_credit_limit: Number,
  available_limit: Number,
  ownedBy: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
});

export default mongoose.model("virtualCard", virtualCardSchema);
