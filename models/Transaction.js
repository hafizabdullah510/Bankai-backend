import mongoose from "mongoose";
const transactionSchema = new mongoose.Schema(
  {
    amount: Number,
    merchant: String,
    transaction_card: String,
    performedBy: String,
    transaction_virtual_card: {
      type: mongoose.Types.ObjectId,
      ref: "VirtualCard",
    },
    isVirtualCardUsed: {
      type: Boolean,
      default: false,
    },
    isWalletUsed: {
      type: Boolean,
      default: false,
    },
    transactionStatus: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("transaction", transactionSchema);
