import {
  OTP_INVALID_SECONDS,
  OTP_MAX_ATTEMPTS,
  OTP_TTL_SECONDS,
} from '../constant/otp.constant.js';
import client from '../services/clientService.js';
import { hash, verifyHash } from '../utils/hash.utils.js';

export const setAuthLoginRedis = async (email, otp) => {
  try {
    const hashOtp = await hash(otp);
    const loginUser = {
      isExistingUser: true,
      otp: hashOtp,
      otpRequestAttempts: 1,
      otpBlockedUntilTime: Date.now(),
      otpExpirationTime: Date.now() + OTP_INVALID_SECONDS * 1000,
      otpCreatedAt: Date.now(),
    };
    await client.set(
      `auth:${email}`,
      JSON.stringify(loginUser),
      'EX',
      OTP_TTL_SECONDS
    );
  } catch (error) {
    console.error(error.message);
    throw new Error('Error in setting auth login redis');
  }
};

export const setAuthCreateNewUserRedis = async (email, newUser, otp) => {
  try {
    if (!newUser) throw new Error('New user not provided');

    const hashOtp = await hash(otp);
    const newUserWithOtp = {
      ...newUser,
      otp: hashOtp,
      isExistingUser: false,
      otpRequestAttempts: 1,
      otpBlockedUntilTime: Date.now(),
      otpExpirationTime: Date.now() + OTP_INVALID_SECONDS * 1000,
      otpCreatedAt: Date.now(),
    };

    await client.set(
      `auth:${email}`,
      JSON.stringify(newUserWithOtp),
      'EX',
      OTP_TTL_SECONDS
    );
  } catch (error) {
    throw new Error('Error in setting auth login redis');
  }
};

export const deleteAuthRedis = async (email) => {
  try {
    await client.del(`auth:${email}`);
  } catch (error) {
    throw new Error('Error in deleting auth redis');
  }
};

export const getAuthRedis = async (email, otp) => {
  try {
    const data = await client.get(`auth:${email}`);
    const user = JSON.parse(data);

    if (!user) {
      throw new Error(
        'No OTP request found for this email. Please request a new OTP.'
      );
    }

    if (user.otpRequestAttempts >= OTP_MAX_ATTEMPTS) {
      throw new Error(
        `Maximum OTP attempts exceeded. Please try again after ${BLOCK_DURATION_SECONDS / 60} minutes.`
      );
    }

    if (user.otpBlockedUntilTime > Date.now()) {
      throw new Error(
        `You are temporarily blocked from requesting OTP. Please try again after ${Math.ceil((user.otpBlockedUntilTime - Date.now()) / 60000)} minutes.`
      );
    }

    if (user.otpExpirationTime < Date.now()) {
      throw new Error('Your OTP has expired. Please request a new OTP.');
    }

    const isOtpMatched = await verifyHash(otp, user.otp);
    return {
      isOtpMatched,
      isExistingUser: user.isExistingUser,
      newUser: user.isExistingUser ? null : user,
    };
  } catch (error) {
    console.error(error.message);
    throw new Error(
      `OTP verification failed: otp may have expired or is invalid. Please request a new one.`
    );
  }
};

export const getUserForResendOtpAuthRedis = async (email) => {
  try {
    const data = await client.get(`auth:${email}`);
    return JSON.parse(data);
  } catch (error) {
    console.error(error.message);
    throw new Error(`Error in getting user for resend OTP from redis`);
  }
};

export const updateAuthRedisForResendOtp = async (user, email) => {
  try {
    await client.set(
      `auth:${email}`,
      JSON.stringify(user),
      'EX',
      OTP_TTL_SECONDS
    );
  } catch (error) {
    console.error(error.message);
    throw new Error(`Error in updating auth redis for resend OTP`);
  }
};

export const setResetPasswordOtpRedis = async (userId, otp) => {
  try {
    const hashOtp = await hash(otp);
    const resetPasswordData = {
      otp: hashOtp,
    };
    await client.set(
      `resetPassword:${userId}`,
      JSON.stringify(resetPasswordData),
      'EX',
      100
    );
  } catch (error) {
    console.error(error.message);
    throw new Error(`Error in setting reset password OTP in redis`);
  }
};

export const getResetPasswordOtpRedis = async (userId, otp) => {
  try {
    const data = await client.get(`resetPassword:${userId}`);
    const resetPasswordData = JSON.parse(data);

    if (!resetPasswordData) {
      throw new Error(
        'No OTP request found for this user. Please request a new OTP.'
      );
    }

    const isOtpMatched = await verifyHash(otp, resetPasswordData.otp);
    return isOtpMatched;
  } catch (error) {
    console.error(error.message);
    throw new Error(`Error in getting reset password OTP from redis`);
  }
};

export const deleteResetPasswordOtpRedis = async (userId) => {
  try {
    await client.del(`resetPassword:${userId}`);
  } catch (error) {
    console.error(error.message);
    throw new Error(`Error in deleting reset password OTP from redis`);
  }
};

export const setAuthRefreshTokenRedis = async (refreshToken, maxAge, email) => {
  try {
    await client.set(`refreshToken:${email}`, refreshToken, 'PX', maxAge);
  } catch (error) {
    console.error(error.message);
    throw new Error(`Error in setting refresh token in redis`);
  }
};

export const getAuthRefreshTokenRedis = async (email) => {
  try {
    const data = await client.get(`refreshToken:${email}`);
    return data;
  } catch (error) {
    console.error(error.message);
    throw new Error(`Error in getting refresh token from redis`);
  }
};
