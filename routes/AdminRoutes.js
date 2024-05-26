import express from "express";
import {
  getAllUsers,
  getAllTransactions,
  getSingleUserTransactions,
  blockUser,
  UnBlockUser,
  getSingleUser,
  getSingleTransaction,
  setAntiEmbarrassmentAmount,
} from "../controllers/AdminController.js";
import { authorizePermission } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/all-users", authorizePermission(["admin"]), getAllUsers);

router.post(
  "/anti-embarrassment-amount",
  authorizePermission(["admin"]),
  setAntiEmbarrassmentAmount
);
router.get(
  "/all-transactions",
  authorizePermission(["admin"]),
  getAllTransactions
);
router.get(
  "/all-transactions/:id",
  authorizePermission(["admin"]),
  getSingleUserTransactions
);
router.get("/single-user/:id", authorizePermission(["admin"]), getSingleUser);
router.get(
  "/single-transaction/:id",
  authorizePermission(["admin"]),
  getSingleTransaction
);

router.get("/block-user/:id", authorizePermission(["admin"]), blockUser);
router.get("/un-block-user/:id", authorizePermission(["admin"]), UnBlockUser);

export default router;
