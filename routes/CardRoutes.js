import express from "express";
const router = express.Router();
import {
  getAllCards,
  addCard,
  deleteCard,
  changePriority,
  freezeCard,
  getSingleCard,
  unfreezeCard,
  getUserVirtualCard,
  recharge_wallet,
} from "../controllers/CardController.js";
import { validateAddCardInput } from "../middlewares/validationMiddleware.js";

router.get("/", getAllCards);
router.post("/", validateAddCardInput, addCard);
router.delete("/:id", deleteCard);
router.get("/:id", getSingleCard);
router.post("/changePriority", changePriority);
router.get("/freeze_card/:id", freezeCard);
router.get("/unfreeze_card/:id", unfreezeCard);
router.get("/user/virtual_card", getUserVirtualCard);
router.post("/user/recharge_wallet", recharge_wallet);

export default router;
