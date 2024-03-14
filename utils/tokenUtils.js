import jwt from "jsonwebtoken";

export const createJWT = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
  return token;
};

export const validateJWT = (token) => {
  const isValid = jwt.verify(token, process.env.JWT_SECRET);
  return isValid;
};
export const addCookiesToResponse = ({ res, token }) => {
  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
    secure: process.env.NODE_ENV === "production",
  });
};
