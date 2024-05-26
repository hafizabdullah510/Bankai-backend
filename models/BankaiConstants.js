import mongoose from "mongoose";
const bankaiConstants = new mongoose.Schema({
  anti_embarrassment_amount: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model("bankaiConstants", bankaiConstants);
