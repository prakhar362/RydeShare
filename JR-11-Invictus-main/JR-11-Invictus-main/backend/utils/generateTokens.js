import jwt from "jsonwebtoken";

import dotenv from "dotenv";
dotenv.config();

export const generateTokenAndSetCookie = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET);
  res.cookie("token", token);
  res.cookie("jwt-riding", token, {
    httpOnly: true,
    secure: false,
    sameSite: "strict",
});

  return token;
};
