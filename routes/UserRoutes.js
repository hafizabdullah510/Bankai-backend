import express from "express";
import { authorizePermission } from "../middlewares/authMiddleware.js";
import {
  validateUserIdParam,
  validateUpdatePasswordInput,
} from "../middlewares/validationMiddleware.js";
import {
  getSingleUser,
  deleteUser,
  getCurrentUser,
  updatePassword,
  makePayment,
  setUserApplicantId,
  userPremiumSubscription,
  updateUserDevices,
} from "../controllers/userController.js";
const router = express.Router();

// router.patch(
//   "/:id",
//   authorizePermission(["admin"]),
//   validateUpdateUserInput,
//   validateUserIdParam,
//   updateUser
// );
router.delete(
  "/:id",
  authorizePermission(["admin"]),
  validateUserIdParam,
  deleteUser
);
router.get("/bankai/current-user", getCurrentUser);
router.patch(
  "/password/update-password",
  validateUpdatePasswordInput,
  updatePassword
);
router.post("/setApplicantId", setUserApplicantId);
router.post("/make_payment", makePayment);
router.get("/account/premium-subscription", userPremiumSubscription);
router.post("/update-devices", updateUserDevices);

export default router;
