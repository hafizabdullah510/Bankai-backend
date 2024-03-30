import mongoose from "mongoose";
const transactionSchema = new mongoose.Schema(
  {
    amount: Number,
    merchant: String,
    transaction_card: {
      type: mongoose.Types.ObjectId,
      ref: "Card",
    },
    transaction_virtual_card: {
      type: mongoose.Types.ObjectId,
      ref: "VirtualCard",
    },
    isVirtualCardUsed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("transaction", transactionSchema);
