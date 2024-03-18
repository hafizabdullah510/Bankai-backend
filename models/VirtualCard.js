import mongoose from "mongoose";
const virtualCardSchema = new mongoose.Schema({
  cardHolderName: String,
  cardNumber: Number,
  cvv: Number,
  issueDate: Date,
  expiryDate: Date,
  cardHolderCnic: String,

  ownedBy: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
});

export default mongoose.model("virtualCard", virtualCardSchema);
