import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  phoneNumber: String,
  cnic: String,
  email: String,
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user",
  },
  cards: [],
  isKycVerified: {
    type: Boolean,
    default: true,
  },
  isPremiumUser: {
    type: Boolean,
    default: false,
  },
  password: String,
  passwordToken: String,
  passwordTokenExpirationDate: Date,
});

userSchema.methods.delPassword = function () {
  let obj = this.toObject();
  delete obj.password;
  return obj;
};

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

export default mongoose.model("user", userSchema);
