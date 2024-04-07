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
} from "../controllers/CardController.js";
import {
  validateAddCardInput,
  validateCardIdParam,
} from "../middlewares/validationMiddleware.js";
import { authorizePermission } from "../middlewares/authMiddleware.js";

router.get("/", getAllCards);
router.post("/", validateAddCardInput, addCard);
router.delete("/:id", deleteCard);
router.get("/:id", getSingleCard);
router.post("/changePriority", changePriority);
router.get("/freeze_card/:id", freezeCard);
router.get("/unfreeze_card/:id", unfreezeCard);
router.get("/user/virtual_card", getUserVirtualCard);

export default router;
