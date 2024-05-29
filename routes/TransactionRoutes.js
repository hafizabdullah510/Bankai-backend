import express from "express";
import { performTransaction } from "../controllers/TransactionController.js";
import { validateTransactionInput } from "../middlewares/validationMiddleware.js";
const router = express.Router();

router.post(
  "/perform_transaction",
  validateTransactionInput,
  performTransaction
);

export default router;
