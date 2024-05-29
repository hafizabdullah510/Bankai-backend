import User from "../models/UserModel.js";
import { StatusCodes } from "http-status-codes";
import { createJWT, addCookiesToResponse } from "../utils/tokenUtils.js";
import crypto from "crypto";
import { comparePassword, hashPasswordToken } from "../utils/passwordUtils.js";
import { sendResetPasswordEmail } from "../utils/sendResetPasswordEmail.js";
import {
  UNAUTHENTICATED_ERROR,
  BAD_REQUEST_ERROR,
} from "../errors/CustomErrors.js";
import { SendNotification } from "../utils/notificationFunctions.js";
import { getFormattedDateAndTime } from "../utils/dateAndTime.js";
import { saveUserNotifications } from "../utils/saveUserNotifications.js";

export const register = async (req, res) => {
  const { cnic, phoneNumber } = req.body;
  req.body.subscription_expiry_Date = new Date(
    Date.now() + 1000 * 60 * 60 * 24 * 15
  );
  await User.create(req.body);
  const token = createJWT({ cnic, phoneNumber });
  //cookie
  addCookiesToResponse({ res, token });
  res.status(StatusCodes.CREATED).json({ msg: "user created" });
};

export const login = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) throw new UNAUTHENTICATED_ERROR("invalid credentials");

  const isPasswordCorrect = await comparePassword(
    req.body.password,
    user.password
  );
  if (!isPasswordCorrect)
    throw new UNAUTHENTICATED_ERROR("invalid credentials");

  const token = createJWT({ userId: user._id, role: user.role });
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    secure: process.env.NODE_ENV === "production",
  });

  const formattedTime = new Date().toLocaleTimeString("en-US", {
    timeZone: "Asia/Karachi",
  });
  let message = `A log in request is initiated at ${formattedTime}`;
  await saveUserNotifications(
    message,
    getFormattedDateAndTime().formattedDate,
    getFormattedDateAndTime().formattedTime,
    user._id
  );
  SendNotification(message);
  res.status(StatusCodes.OK).json({ msg: "logged In" });
};

export const forgot_password = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    throw new BAD_REQUEST_ERROR("please provide valid email");
  }

  const user = User.findOne({ email });
  if (user) {
    const passwordToken = crypto.randomBytes(70).toString("hex");

    //send email
    const origin = "http://localhost:5174";
    await sendResetPasswordEmail({
      email: email,
      token: passwordToken,
      origin,
    });

    const tenMinutes = 1000 * 60 * 10;

    const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);

    await User.updateOne(
      user._id,
      {
        passwordToken: hashPasswordToken(passwordToken),
        passwordTokenExpirationDate,
      },
      {
        runValidators: true,
        new: true,
      }
    );
  }
  res
    .status(StatusCodes.OK)
    .json({ msg: "please check your email to reset password" });
};
export const resetPassword = async (req, res) => {
  const { email, token, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    const currentDate = new Date(Date.now());

    if (
      user.passwordToken === hashPasswordToken(token) &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      console.log("success");
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();
    }
  }

  res.status(StatusCodes.OK).json({ msg: "Password Reseted" });
};
export const logout = async (req, res) => {
  res.cookie("token", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(StatusCodes.OK).json({ msg: "user logged out" });
};
