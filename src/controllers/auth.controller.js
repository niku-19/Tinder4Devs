import { Users } from '../models/users.schema.js';
import createOAuthClient from '../services/googleAuthService.js';
import { google } from 'googleapis';
import { sendAuthCookie } from '../services/sendAuthCookieService.js';
import { sanitizeUser, sendResponse } from '../utils/sendResponse.utils.js';
import {
  validateLocalAuth,
  validateResendOtp,
  validateResetPassword,
  validateResetPasswordLink,
  validateVerifyOtp,
} from '../utils/auth.utils.js';
import { sendEmail } from '../utils/sendEmail.utils.js';
import { generateOtp } from '../utils/generateOtp.utils.js';
import {
  deleteAuthRedis,
  deleteResetPasswordOtpRedis,
  getAuthRedis,
  getAuthRefreshTokenRedis,
  getResetPasswordOtpRedis,
  getUserForResendOtpAuthRedis,
  setAuthCreateNewUserRedis,
  setAuthLoginRedis,
  setResetPasswordOtpRedis,
  updateAuthRedisForResendOtp,
} from '../redis/auth.redis.js';
import {
  BLOCK_DURATION_SECONDS,
  OTP_INVALID_SECONDS,
  OTP_MAX_ATTEMPTS,
} from '../constant/otp.constant.js';
import { hash } from '../utils/hash.utils.js';
import {
  OTP_VERIFICATION_SUBJECT,
  otpVerificationTemplate,
  RESET_PASSWORD_SUBJECT,
  RESET_PASSWORD_SUCCESS_SUBJECT,
  resetPasswordLinkTemplate,
  resetPasswordSuccessTemplate,
} from '../constant/sendEmail.constant.js';
import asyncHandler from '../utils/asyncHandler.utils.js';
import { environmentConfigValue } from '../config/environmentConfig.js';
import jwt from 'jsonwebtoken';

export const signOut = async (request, response) => {
  try {
    //we will clear the token in the cookies
    response.clearCookie(process.env.NAME_OF_TOKEN || 'token', null, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      expireIn: new Date(Date.now()),
    });

    response.status(200).json({
      message: 'User signed out successfully',
      data: {
        _id: request.user._id,
      },
    });
  } catch (error) {
    console.error('Error in signOut controller:', error);
    response.status(500).json({
      message: 'An error occurred during sign-out. Please try again later.',
      error: error.message,
    });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return sendResponse(res, {
        statusCode: 400,
        message: 'Authorization code required',
      });
    }

    const client = createOAuthClient();
    const { tokens } = await client.getToken(code);
    if (!tokens) {
      return sendResponse(res, {
        statusCode: 401,
        message: 'Failed to exchange token',
      });
    }

    client.setCredentials(tokens);

    const oauth2 = google.oauth2({ auth: client, version: 'v2' });
    const { data } = await oauth2.userinfo.get();

    if (!data.email || !data.verified_email) {
      return sendResponse(res, {
        statusCode: 400,
        message: 'Unverified Google account',
      });
    }

    let user = await Users.findOne({ email: data.email });

    // Existing user
    if (user) {
      if (user.authType !== 'GOOGLE') {
        return sendResponse(res, {
          statusCode: 409,
          message: 'Email already registered with local auth',
        });
      }

      sendAuthCookie(res, user);
      return sendResponse(res, {
        statusCode: 200,
        message: 'Login successful',
        data: sanitizeUser(user),
      });
    }

    // New user
    user = await Users.create({
      email: data.email,
      name: data.name,
      profilePicture: data.picture,
      authType: 'GOOGLE',
      googleId: data.id,
      STATUS: 'NEW',
      userStatus: 'ACTIVE',
    });

    sendAuthCookie(res, user);
    return sendResponse(res, {
      statusCode: 201,
      message: 'User created',
      data: sanitizeUser(user),
    });
  } catch (err) {
    console.error(err);
    return sendResponse(res, {
      statusCode: 500,
      message: 'Google auth failed',
    });
  }
};

export const localAuth = async (request, response) => {
  try {
    validateLocalAuth(request);

    const { email, password } = request.body;

    const existingUser = await Users.findOne({ email });

    // 🚫 Google account exists
    if (existingUser && existingUser.authType === 'GOOGLE') {
      return sendResponse(response, {
        statusCode: 409,
        message: 'User exists with Google auth. Use Google login.',
      });
    }

    // ✅ Local user exists → login
    if (existingUser) {
      const isPasswordCorrect = await existingUser.verifyPassword(password);

      if (!isPasswordCorrect) {
        return sendResponse(response, {
          statusCode: 401,
          message: 'Invalid credentials',
        });
      }

      const otp = generateOtp();
      const template = otpVerificationTemplate(otp);

      sendEmail(existingUser.email, OTP_VERIFICATION_SUBJECT, template);

      await setAuthLoginRedis(email, otp);

      return sendResponse(response, {
        statusCode: 200,
        message: 'Your OTP has been sent. Please verify to continue.',
      });
    }
    const isProduction = process.env.CURRENT_ENV === process.env.PRODUCTION;
    const otp = isProduction ? generateOtp() : '123123';
    const template = otpVerificationTemplate(otp);

    sendEmail(email, OTP_VERIFICATION_SUBJECT, template);

    // 🆕 New user → signup
    const newUser = {
      email,
      password,
      authType: 'LOCAL',
      STATUS: 'NEW',
      userStatus: 'ACTIVE',
      googleId: '',
      profilePicture: '',
    };

    await setAuthCreateNewUserRedis(email, newUser, otp);

    return sendResponse(response, {
      statusCode: 200,
      message: 'Your OTP has been sent. Please verify to continue.',
    });
  } catch (error) {
    return sendResponse(response, {
      statusCode: 500,
      message: error.message,
    });
  }
};

export const verifyOtp = async (request, response) => {
  try {
    validateVerifyOtp(request);
    const { email, code } = request.body;
    const { isOtpMatched, isExistingUser, newUser } = await getAuthRedis(
      email,
      code
    );

    if (!isOtpMatched) {
      return sendResponse(response, {
        statusCode: 401,
        message:
          '“Your OTP is invalid. It may have expired. Please request a new one.”',
      });
    }

    if (isExistingUser) {
      const user = await Users.findOne({ email });

      if (!user) {
        return sendResponse(response, {
          statusCode: 404,
          message: 'User not found',
        });
      }

      sendAuthCookie(response, user, true);
      await deleteAuthRedis(email);

      return sendResponse(response, {
        statusCode: 200,
        message: 'Login successful',
        data: sanitizeUser(user),
      });
    }

    if (!newUser) {
      return sendResponse(response, {
        statusCode: 500,
        message: 'Something Went Wrong',
      });
    }

    delete newUser.otp;
    delete newUser.isExistingUser;
    const newCreateUser = new Users(newUser);
    await newCreateUser.save();

    if (!newCreateUser) {
      return sendResponse(response, {
        statusCode: 500,
        message: 'Error in creating user',
      });
    }

    sendAuthCookie(response, newCreateUser, true);
    await deleteAuthRedis(email);

    return sendResponse(response, {
      statusCode: 201,
      message: 'Signup successful',
      data: sanitizeUser(newCreateUser),
    });
  } catch (error) {
    return sendResponse(response, {
      statusCode: 500,
      message: error.message,
    });
  }
};

export const resendOtp = async (request, response) => {
  try {
    validateResendOtp(request);
    const { email } = request.body;
    const user = await getUserForResendOtpAuthRedis(email);

    if (!user) {
      return sendResponse(response, {
        statusCode: 404,
        message:
          'No OTP request found for this email. Please request a new OTP.',
      });
    }

    if (user.otpRequestAttempts >= OTP_MAX_ATTEMPTS) {
      return sendResponse(response, {
        statusCode: 403,
        message: `Maximum OTP attempts exceeded. Please try again after ${BLOCK_DURATION_SECONDS / 60} minutes.`,
      });
    }

    if (user.otpBlockedUntilTime > Date.now()) {
      return sendResponse(response, {
        statusCode: 403,
        message: `You are temporarily blocked from requesting OTP. Please try again after ${Math.ceil((user.otpBlockedUntilTime - Date.now()) / 60000)} minutes.`,
      });
    }

    const updatedRedisUser = { ...user };

    updatedRedisUser.otpRequestAttempts += 1;
    updatedRedisUser.otpExpirationTime =
      Date.now() + OTP_INVALID_SECONDS * 1000;
    updatedRedisUser.otpCreatedAt = Date.now();

    if (updatedRedisUser.otpRequestAttempts >= OTP_MAX_ATTEMPTS) {
      updatedRedisUser.otpBlockedUntilTime =
        Date.now() + BLOCK_DURATION_SECONDS * 1000;
    }

    const otp = generateOtp();
    const template = otpVerificationTemplate(otp);
    sendEmail(email, OTP_VERIFICATION_SUBJECT, template);
    const hashedOtp = await hash(otp);
    updatedRedisUser.otp = hashedOtp;

    await updateAuthRedisForResendOtp(updatedRedisUser, email);

    return sendResponse(response, {
      statusCode: 200,
      message: 'Your OTP has been resent. Please verify to continue.',
    });
  } catch (error) {
    return sendResponse(response, {
      statusCode: 500,
      message: error.message,
    });
  }
};

export const resetPasswordLink = async (request, response) => {
  try {
    validateResetPasswordLink(request);
    const { email } = request.body;

    const user = await Users.findOne({ email });

    if (!user) {
      return sendResponse(response, {
        statusCode: 404,
        message: 'User not found with the provided email',
      });
    }

    if (user.authType === 'GOOGLE') {
      return sendResponse(response, {
        statusCode: 400,
        message: 'Password reset not available for Google-authenticated users',
      });
    }
    const resetLink = `${process.env.APP_RESET_PASSWORD_URL}/${user?._id}`;
    const code = generateOtp();
    const sendResetPasswordLinkTemplate = resetPasswordLinkTemplate(
      resetLink,
      code
    );

    sendEmail(email, RESET_PASSWORD_SUBJECT, sendResetPasswordLinkTemplate);
    await setResetPasswordOtpRedis(user?._id, code);

    return sendResponse(response, {
      statusCode: 200,
      message: 'Password reset link has been sent to your email',
    });
  } catch (error) {
    console.error('Error in resetPasswordLink controller:', error);
    return sendResponse(response, {
      statusCode: 500,
      message:
        'An error occurred while processing your request. Please try again later.',
    });
  }
};

export const resetPassword = async (request, response) => {
  try {
    validateResetPassword(request);
    const { userId, newPassword, code } = request.body;

    const user = await Users.findById(userId);

    if (!user) {
      return sendResponse(response, {
        statusCode: 404,
        message: 'User not found',
      });
    }

    if (user.authType === 'GOOGLE') {
      return sendResponse(response, {
        statusCode: 400,
        message: 'Password reset not available for Google-authenticated users',
      });
    }

    const isOtpMatched = await getResetPasswordOtpRedis(user?._id, code);

    if (!isOtpMatched) {
      return sendResponse(response, {
        statusCode: 401,
        message: 'Invalid or expired reset code',
      });
    }

    user.password = newPassword;
    await user.save();

    const loginUrl = process.env.APP_AUTH_URL;
    const sendResetPasswordSuccessTemplate =
      resetPasswordSuccessTemplate(loginUrl);

    sendEmail(
      user.email,
      RESET_PASSWORD_SUCCESS_SUBJECT,
      sendResetPasswordSuccessTemplate
    );

    await deleteResetPasswordOtpRedis(user?._id);

    return sendResponse(response, {
      statusCode: 200,
      message:
        'Password reset successfully! Please log in with your new password.',
    });
  } catch (error) {
    console.error('Error in resetPassword controller:', error);
    return sendResponse(response, {
      statusCode: 500,
      message:
        'An error occurred while resetting your password. Please try again later.',
    });
  }
};

export const getMe = asyncHandler(async (request, response) => {
  const user = request.user;

  if (!user) {
    return sendResponse(response, {
      statusCode: 401,
      message: 'User not found, Please login again',
    });
  }

  return sendResponse(response, {
    statusCode: 200,
    message: 'User Found!',
    data: sanitizeUser(user),
  });
});

/**
 * @description
 * This is generate token when token is expired using the refresh token.
 * 1. first we get the refresh token from the cookies.
 * 2. we also received email from the param from the user.
 * 3. we check if the refresh token for that email is present in the redis or not.
 * 4. If it is not present then we return the response that the refresh token is not valid. status code 500.
 * 5. If we found the refresh token then we take the refresh token verify the token.
 * 6. If token verify with the secret then we find the user from the database and then create new token.
 * 7. we create new refresh token and update the redis.
 * 8. and return the new access token and refresh token as cookie to the user.
 */

export const refreshToken = asyncHandler(async (request, response) => {
  const refreshToken = request.cookies.TOKEN_REFRESH;
  const email = request.body.email;

  if (!refreshToken) {
    return sendResponse(response, {
      statusCode: 401,
      message: 'Refresh token is required',
    });
  }

  if (!email) {
    return sendResponse(response, {
      statusCode: 401,
      message: 'Email is required',
    });
  }

  const isTokenPresentInRedis = await getAuthRefreshTokenRedis(email);

  if (!isTokenPresentInRedis) {
    return sendResponse(response, {
      statusCode: 403,
      message: 'Refresh token is not valid',
    });
  }

  const { jwt_refresh_secret } = environmentConfigValue();

  const decoded = jwt.verify(refreshToken, jwt_refresh_secret);

  const userId = decoded._id;

  if (!userId) {
    return sendResponse(response, {
      statusCode: 401,
      message: 'Invalid refresh token',
    });
  }

  const user = await Users.findById(userId);

  if (!user) {
    return sendResponse(response, {
      statusCode: 404,
      message: 'User not found',
    });
  }

  sendAuthCookie(response, user, true);

  return sendResponse(response, {
    statusCode: 200,
    message: 'Token refreshed successfully',
  });
});
