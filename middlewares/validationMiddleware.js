import { body, param, validationResult } from "express-validator";
import {
  BAD_REQUEST_ERROR,
  NOT_FOUND_ERROR,
  UNAUTHORIZED_ERROR,
} from "../errors/CustomErrors.js";
import mongoose from "mongoose";
import User from "../models/UserModel.js";
import Card from "../models/CardModel.js";
import VirtualCard from "../models/VirtualCard.js";
import { getContract } from "../utils/contracts.js";
import { ethers } from "ethers";

const abiPath =
  "/Users/abdullahtariq/Desktop/Bankai/bankai-app/contracts/CardDetailsContract_sol_CardDetailsContract.abi";
const addressPath =
  "/Users/abdullahtariq/Desktop/Bankai/bankai-app/CardDetailsContractAddress.txt";

const validateErrors = (validationValues) => {
  return [
    validationValues,
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((err) => err.msg);
        if (errorMessages[0].startsWith("no employee")) {
          throw new NOT_FOUND_ERROR(errorMessages);
        }
        if (errorMessages[0].startsWith("not authorized")) {
          throw new UNAUTHORIZED_ERROR("not authorized to access the route");
        }
        throw new BAD_REQUEST_ERROR(errorMessages);
      }
      next();
    },
  ];
};

export const validateRegisterInput = validateErrors([
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("invalid email")
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) {
        throw new BAD_REQUEST_ERROR("email already exists");
      }
    }),
  body("firstName").notEmpty().withMessage("firstName is required"),
  body("lastName").notEmpty().withMessage("lastName is required"),
  body("cnic")
    .notEmpty()
    .withMessage("cnic is required")
    .isNumeric()
    .withMessage("cnic should be in numbers")
    .isLength({ min: 13, max: 13 })
    .withMessage("cnic length should be 13 digits"),
  body("phoneNumber")
    .notEmpty()
    .withMessage("phoneNumber is required")
    .isLength({ min: 11, max: 11 })
    .withMessage("phone number should be 11 digits"),
  body("password")
    .notEmpty()
    .withMessage("password is required")
    .matches(/^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[\W_]).{8,}$/) // Alphanumeric with special characters
    .withMessage(
      "Password must contain at least one letter, one number, and one special character"
    )
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters long"),
]);
export const validateLoginInput = validateErrors([
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("invalid email"),

  body("password").notEmpty().withMessage("password is required"),
]);
export const validateForgotPasswordInput = validateErrors([
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("invalid email"),
]);
export const validateResetPasswordInput = validateErrors([
  body("email")
    .notEmpty()
    .withMessage("email is required")
    .isEmail()
    .withMessage("invalid email"),
  body("token").notEmpty().withMessage("token is required"),
  body("password")
    .notEmpty()
    .withMessage("password is required")
    .matches(/^(?=.*[0-9])(?=.*[a-zA-Z])(?=.*[\W_]).{8,}$/) // Alphanumeric with special characters
    .withMessage(
      "Password must contain at least one letter, one number, and one special character"
    )
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters long"),
]);

export const validateUserIdParam = validateErrors([
  param("id").custom(async (value, { req }) => {
    const isValid = mongoose.Types.ObjectId.isValid(value);
    if (!isValid) throw new BAD_REQUEST_ERROR(`invalid mongoDb id`);
    const user = await User.findById(value);
    if (!user) throw new NOT_FOUND_ERROR(`no user with id ${value}`);
  }),
]);

export const validateUpdatePasswordInput = validateErrors([
  body("currentPassword").notEmpty().withMessage("currentPassword is required"),
  body("newPassword")
    .notEmpty()
    .withMessage("password is required")
    .isAlphanumeric("en-US")
    .withMessage("password should be alphanumeric")
    .isLength({ min: 8 })
    .withMessage("password must be at least 8 characters long"),
]);

export const validateAddCardInput = validateErrors([
  body("cardHolderName").notEmpty().withMessage("card holder name is required"),
  body("cardNumber")
    .notEmpty()
    .withMessage("card number is required")
    .isLength({ min: 16, max: 16 })
    .withMessage("The length must be 16 digits")
    .custom(async (cardNumber, { req }) => {
      const cardContact = await getContract(abiPath, addressPath);
      const user = await User.findOne({ _id: req.user.userId });
      const cardIDs = user.cards.map((card) => card.cardID);
      const cardIDsBytes32 = cardIDs.map((cardID) =>
        ethers.encodeBytes32String(cardID)
      );
      const cardDetails = await cardContact.getAllCardDetails(cardIDsBytes32);
      //from blockchain
      const cards = cardDetails.map((card) => parseInt(card[3]));
      const CardAlreadyAdded = cards.find((cardNum) => cardNum === cardNumber);
      if (CardAlreadyAdded) {
        throw new BAD_REQUEST_ERROR("Card already Added");
      }
    }),
  body("cardHolderCnic")
    .notEmpty()
    .withMessage("cnic is required")
    .isLength({ min: 13, max: 13 })
    .withMessage("The length must be 13 characters"),
  body("cvv")
    .notEmpty()
    .withMessage("cvv is required")
    .isLength({ min: 3, max: 3 })
    .withMessage("The length must be 3 digits"),
  body("issueDate").notEmpty().withMessage("issue date is required"),
  body("expiryDate").notEmpty().withMessage("expiry date is required"),
  body("bankName").notEmpty().withMessage("Bank Name is required"),
  body("cardType").notEmpty().withMessage("card type is required"),
]);

export const validateCardIdParam = validateErrors([
  param("id").custom(async (value, { req }) => {
    const isValid = mongoose.Types.ObjectId.isValid(value);
    if (!isValid) throw new BAD_REQUEST_ERROR(`invalid mongoDb id`);
    const card = await Card.findById(value);
    if (!card) throw new NOT_FOUND_ERROR(`no card with id ${value}`);
  }),
]);

// export const validateCardPriority = validateErrors([
//   body("priorityNumber")
//     .notEmpty()
//     .withMessage("Priority Number is required")
//     .isNumeric()
//     .withMessage("Priority Number must be an integer value"),
// ]);
export const validateTransactionInput = validateErrors([
  body("amount")
    .notEmpty()
    .withMessage("amount is required")
    .isNumeric()
    .withMessage("amount must be an integer value"),
  body("merchant").notEmpty().withMessage("merchant name is required"),
  body("cardNumber")
    .notEmpty()
    .withMessage("Card number is required")
    .isNumeric()
    .withMessage("card number must be in digits")
    .custom(async (cardNumber) => {
      const card = await VirtualCard.findOne({ cardNumber });
      if (!card) {
        throw new UNAUTHORIZED_ERROR("Not Authorized to perform transaction");
      }
    }),
  body("cvv")
    .notEmpty()
    .withMessage("cvv is required")
    .isNumeric()
    .withMessage("cvv must be an integer value"),
]);
