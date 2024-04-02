import express from "express";
import {
  authenticationMiddleware,
  authorizePermission,
} from "../middlewares/authMiddleware.js";
import {
  performTransaction,
  payLoan,
  getAllTransactions,
} from "../controllers/TransactionController.js";
import { validateTransactionInput } from "../middlewares/validationMiddleware.js";
const router = express.Router();

router.post(
  "/perform_transaction",
  validateTransactionInput,
  performTransaction
);

export default router;
