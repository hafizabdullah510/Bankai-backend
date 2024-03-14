import express from "express";
const router = express.Router();
import {
  getAllCards,
  addCard,
  deleteCard,
  changePriority,
} from "../controllers/CardController.js";
import {
  validateAddCardInput,
  validateCardIdParam,
  validateCardPriority,
} from "../middlewares/validationMiddleware.js";
import { authorizePermission } from "../middlewares/authMiddleware.js";

router.get("/", getAllCards);
router.post("/", validateAddCardInput, addCard);
router.delete("/:id", validateCardIdParam, deleteCard);
router.patch("/:id", validateCardPriority, changePriority);
export default router;
