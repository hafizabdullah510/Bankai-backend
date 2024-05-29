import express from "express";
import { validateUpdatePasswordInput } from "../middlewares/validationMiddleware.js";
import {
  getCurrentUser,
  updatePassword,
  setUserApplicantId,
  userPremiumSubscription,
  updateUserDevices,
} from "../controllers/userController.js";

const router = express.Router();

router.get("/bankai/current-user", getCurrentUser);
router.patch(
  "/password/update-password",
  validateUpdatePasswordInput,
  updatePassword
);
router.post("/setApplicantId", setUserApplicantId);
router.get("/account/premium-subscription", userPremiumSubscription);
router.post("/update-devices", updateUserDevices);

export default router;
