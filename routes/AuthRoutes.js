import express from "express";
import {
  register,
  login,
  logout,
  forgot_password,
  resetPassword,
} from "../controllers/authController.js";
import {
  validateRegisterInput,
  validateLoginInput,
  validateForgotPasswordInput,
  validateResetPasswordInput,
} from "../middlewares/validationMiddleware.js";

const router = express.Router();

router.post("/register", validateRegisterInput, register);
router.post("/login", validateLoginInput, login);
router.post("/forgot_password", validateForgotPasswordInput, forgot_password);
router.post("/reset_password", validateResetPasswordInput, resetPassword);
router.get("/logout", logout);

export default router;
