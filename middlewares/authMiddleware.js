import {
  BAD_REQUEST_ERROR,
  UNAUTHENTICATED_ERROR,
  UNAUTHORIZED_ERROR,
} from "../errors/CustomErrors.js";
import User from "../models/UserModel.js";
import { validateJWT } from "../utils/tokenUtils.js";

export const authenticationMiddleware = (req, res, next) => {
  const { token } = req.cookies;
  if (!token) throw new UNAUTHENTICATED_ERROR("Not authenticated");

  try {
    const { userId, role } = validateJWT(token);
    req.user = { userId, role };
    next();
  } catch (error) {
    throw new UNAUTHENTICATED_ERROR("Not authenticated");
  }
};

export const isUserBlocked = async (req, res, next) => {
  const user = await User.findOne({ _id: req.user.userId });
  if (user.isBlocked) {
    throw new UNAUTHORIZED_ERROR("Not Authorized. You have been blocked!");
  }
  next();
};

export const authorizePermission = ([...roles]) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UNAUTHORIZED_ERROR("not authorized to access the route");
    }
    next();
  };
};
