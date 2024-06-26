import { UNAUTHENTICATED_ERROR } from "../errors/CustomErrors.js";
import User from "../models/UserModel.js";
import { StatusCodes } from "http-status-codes";
import { comparePassword } from "../utils/passwordUtils.js";
import { SendNotification } from "../utils/notificationFunctions.js";
import { getFormattedDateAndTime } from "../utils/dateAndTime.js";
import { saveUserNotifications } from "../utils/saveUserNotifications.js";

export const updateUser = async (req, res) => {
  const { id } = req.params;
  await User.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  res.status(StatusCodes.OK).json({ msg: "user updated" });
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
  const currentDate = new Date(Date.now());
  if (user.subscription_expiry_Date < currentDate) {
    let message = `Your subscription is expired. Please renew the subscription.`;
    SendNotification(message);
  }
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

export const setUserApplicantId = async (req, res) => {
  const { applicantId } = req.body;
  const user = await User.findOne({ _id: req.user.userId });
  user.applicantId = applicantId;
  await user.save();

  res.status(StatusCodes.OK).json({ msg: "Applicant id assigned" });
};

export const userPremiumSubscription = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId });

  user.isPremiumUser = true;
  user.subscription_expiry_Date = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * 30
  );
  await user.save();
  let message = "Your subscription is renewed.";
  await saveUserNotifications(
    message,
    getFormattedDateAndTime().formattedDate,
    getFormattedDateAndTime().formattedTime,
    user._id
  );
  SendNotification(message);
  res.status(StatusCodes.OK).json({ msg: "Subscription Successful!" });
};

export const updateUserDevices = async (req, res) => {
  const adminUser = await User.findByIdAndUpdate(req.user.userId, req.body, {
    new: true,
  });
  const user = adminUser.delPassword();
  res.status(StatusCodes.OK).json({ user });
};
