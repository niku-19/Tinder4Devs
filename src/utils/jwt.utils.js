import jwt from "jsonwebtoken";
import { environmentConfigValue } from "../config/environmentConfig.js";

export const generateJsonWebToken = (payload) => {
  const { jwt_secret } = environmentConfigValue();

  const token = jwt.sign(payload, jwt_secret, { expiresIn: "1h" });

  return token;
};

export const encodedCookies = (userData) => {
  return Buffer.from(JSON.stringify(userData)).toString("base64");
};

export const decodedCookies = (encodedData) => {
  return JSON.parse(Buffer.from(encodedData, "base64").toString("utf8"));
};
