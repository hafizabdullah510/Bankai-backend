import {
  UNAUTHENTICATED_ERROR,
  BAD_REQUEST_ERROR,
  UNAUTHORIZED_ERROR,
} from "../errors/CustomErrors.js";
import User from "../models/UserModel.js";
import { StatusCodes } from "http-status-codes";
import { comparePassword } from "../utils/passwordUtils.js";
import Stripe from "stripe";
const stripe = new Stripe(
  "sk_test_51OvwcEHoalhmTGHSrNJ1nKB9ivxwSNr8dT7DNfFCL1YzwFQcbaQxSuKN8yXmx1fhRlqGBw4zm3B2A37Ud4VzIAVJ00ML05Bgug"
);

export const getAllUsers = async (req, res) => {
  const users = await User.find({ role: "user" });
  const filteredUsers = users.map((user) => user.delPassword());
  res.status(StatusCodes.OK).json({ filteredUsers });
};
export const updateUser = async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  res.status(StatusCodes.OK).json({ msg: "user updated" });
};

export const deleteUser = async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndDelete(id);
  res.status(StatusCodes.OK).json({ msg: "user deleted" });
};

export const getSingleUser = async (req, res) => {
  const { id } = req.params;
  const singleUser = await User.findOne({ _id: id });
  const user = singleUser.delPassword();

  res.status(StatusCodes.OK).json({ user });
};
export const getCurrentUser = async (req, res) => {
  const adminUser = await User.findOne({ _id: req.user.userId });
  const user = adminUser.delPassword();
  res.status(StatusCodes.OK).json({ user });
};
export const updatePassword = async (req, res) => {
  const currentUser = await User.findOne({ _id: req.user.userId });

  const { currentPassword, newPassword } = req.body;
  const isPasswordCorrect = await comparePassword(
    currentPassword,
    currentUser.password
  );
  if (!isPasswordCorrect)
    throw new UNAUTHENTICATED_ERROR("invalid existing password");

  currentUser.password = newPassword;
  await currentUser.save();

  res.status(StatusCodes.OK).json({ msg: "Password changed successfully" });
};

export const makePayment = async (req, res) => {
  try {
    const customer = await stripe.customers.create();
    const ephemeralKey = await stripe.ephemeralKeys.create(
      { customer: customer.id },
      { apiVersion: "2023-10-16" }
    );
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 2500,
      currency: "USD",
      customer: customer.id,
      description: "The transaction for Bankai premium account",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      paymentIntent: paymentIntent.client_secret,
      ephemeralKey: ephemeralKey.secret,
      customer: customer.id,
      publishableKey: process.env.PUBLIC_KEY,
    });
  } catch (error) {
    console.log(error);
    return res.json({ error: true, message: error.message, data: null });
  }
};
