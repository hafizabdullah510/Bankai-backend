import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const userSchema = new mongoose.Schema(
  {
    firstName: String,
    lastName: String,
    phoneNumber: String,
    cnic: String,
    email: String,
    applicantId: String,
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    cards: [],
    credit_score: {
      type: Number,
      default: 5,
    },
    kycStatus: {
      type: String,
      enum: ["not_initiated", "pending", "verified"],
      default: "not_initiated",
    },
    isPremiumUser: {
      type: Boolean,
      default: false,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    notifications: [],
    subscription_expiry_Date: Date,
    password: String,
    passwordToken: String,
    passwordTokenExpirationDate: Date,
  },
  {
    timestamps: true,
  }
);

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
