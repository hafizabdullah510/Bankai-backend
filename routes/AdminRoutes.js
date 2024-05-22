import express from "express";
import {
  getAllUsers,
  getAllTransactions,
  getSingleUserTransactions,
  getLoanTakenUsers,
  getLoanDefaulters,
  blockUser,
  UnBlockUser,
} from "../controllers/AdminController.js";
import { authorizePermission } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/all-users", authorizePermission(["admin"]), getAllUsers);
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
router.get(
  "/anti-embarrassment-availers",
  authorizePermission(["admin"]),
  getLoanTakenUsers
);
router.get(
  "/loan-defaulters",
  authorizePermission(["admin"]),
  getLoanDefaulters
);
router.get("/block-user/:id", authorizePermission(["admin"]), blockUser);
router.get("/un-block-user/:id", authorizePermission(["admin"]), UnBlockUser);

export default router;
