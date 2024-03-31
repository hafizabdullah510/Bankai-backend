import express from "express";
const router = express.Router();
import {
  getAllCards,
  addCard,
  deleteCard,
  changePriority,
  renewLimit,
} from "../controllers/CardController.js";
import {
  validateAddCardInput,
  validateCardIdParam,
} from "../middlewares/validationMiddleware.js";
import { authorizePermission } from "../middlewares/authMiddleware.js";

router.get("/", getAllCards);
router.get("/renew_limit", renewLimit);
router.post("/", validateAddCardInput, addCard);
router.delete("/:id", deleteCard);
router.post("/changePriority", changePriority);
export default router;
