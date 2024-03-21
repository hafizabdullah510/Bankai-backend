import express from "express";
import { getAllUsers } from "../controllers/userController.js";
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
} from "../controllers/userController.js";
const router = express.Router();
router.get("/all-users", authorizePermission(["admin"]), getAllUsers);
router.get(
  "/:id",
  authorizePermission(["admin"]),
  validateUserIdParam,
  getSingleUser
);

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
router.post("/make_payment", makePayment);

export default router;
