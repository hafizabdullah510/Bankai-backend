import { body, param, validationResult } from "express-validator";
import {
  BAD_REQUEST_ERROR,
  NOT_FOUND_ERROR,
  UNAUTHORIZED_ERROR,
} from "../errors/CustomErrors.js";
import mongoose from "mongoose";
import User from "../models/UserModel.js";
import Card from "../models/CardModel.js";

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
    .isAlphanumeric("en-US")
    .withMessage("password should be alphanumeric")
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
    .isAlphanumeric("en-US")
    .withMessage("password should be alphanumeric")
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
    .custom(async (cardNumber) => {
      const user = await Card.findOne({ cardNumber });
      if (user) {
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

export const validateCardPriority = validateErrors([
  body("priorityNumber")
    .notEmpty()
    .withMessage("Priority Number is required")
    .isNumeric()
    .withMessage("Priority Number must be an integer value"),
]);
