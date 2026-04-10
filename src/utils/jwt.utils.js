import jwt from 'jsonwebtoken';
import { environmentConfigValue } from '../config/environmentConfig.js';

export const generateJsonWebToken = (payload, isRefreshToken = false) => {
  const { jwt_secret, jwt_refresh_secret } = environmentConfigValue();
  const expiresIn = isRefreshToken
    ? process.env.MAX_AGE_OF_REFRESH_TOKEN || '15m'
    : process.env.MAX_AGE_OF_TOKEN || '7d';

  const secret = isRefreshToken ? jwt_refresh_secret : jwt_secret;

  const token = jwt.sign(payload, secret, {
    expiresIn,
  });

  return token;
};

export const encodedCookies = (userData) => {
  return Buffer.from(JSON.stringify(userData)).toString('base64');
};

export const decodedCookies = (encodedData) => {
  return JSON.parse(Buffer.from(encodedData, 'base64').toString('utf8'));
};
