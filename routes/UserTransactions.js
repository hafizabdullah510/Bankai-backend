import express from "express";
import {
  getAllTransactions,
  getSingleCardTransactions,
  getSingleTransaction,
} from "../controllers/TransactionController.js";

const router = express.Router();

router.post("/allTransactions", getAllTransactions);
router.get("/:id", getSingleTransaction);
router.get("/card/:id", getSingleCardTransactions);

export default router;
