import validator from 'validator';

export const validateLocalAuth = (request) => {
  try {
    const { email, password } = request.body;

    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    if (!validator.isEmail(email)) {
      throw new Error('Invalid email address');
    }

    if (!validator.isStrongPassword(password)) {
      throw new Error('Invalid password');
    }
  } catch (error) {
    console.error('Validation error:', error.message);
    throw error;
  }
};

export const validateVerifyOtp = (request) => {
  try {
    const { email, code } = request.body;

    if (!email || !code) {
      throw new Error('Email and code are required');
    }

    if (!validator.isEmail(email)) {
      throw new Error('Invalid email address');
    }

    if (!validator.isNumeric(code)) {
      throw new Error('Invalid OTP');
    }

    if (!validator.isLength(code, { min: 6, max: 6 })) {
      throw new Error('Invalid OTP');
    }
  } catch (error) {
    console.error('Validation error:', error.message);
    throw error;
  }
};

export const validateResendOtp = (request) => {
  try {
    const { email } = request.body;

    if (!email) {
      throw new Error('Email is required');
    }

    if (!validator.isEmail(email)) {
      throw new Error('Invalid email address');
    }

    if (!validator.isLength(email, { min: 5, max: 255 })) {
      throw new Error('Email length should be between 5 to 255 characters');
    }
  } catch (error) {
    console.error('Validation error:', error.message);
    throw error;
  }
};
export const validateResetPasswordLink = (request) => {
  try {
    const { email } = request.body;

    if (!email) {
      throw new Error('Email is required');
    }

    if (!validator.isEmail(email)) {
      throw new Error('Invalid email address');
    }

    if (!validator.isLength(email, { min: 5, max: 255 })) {
      throw new Error('Email length should be between 5 to 255 characters');
    }
  } catch (error) {
    console.error('Validation error:', error.message);
    throw error;
  }
};

export const validateResetPassword = (request) => {
  try {
    const { newPassword, confirmPassword, code, userId } = request.body;

    if (!newPassword || !confirmPassword || !code || !userId) {
      throw new Error(
        'New password, confirm password, code, and userId are required'
      );
    }

    if (newPassword !== confirmPassword) {
      throw new Error('New password and confirm password do not match');
    }

    if (!validator.isStrongPassword(newPassword)) {
      throw new Error(
        'New password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and symbols.'
      );
    }

    if (!validator.isNumeric(code)) {
      throw new Error('Invalid OTP');
    }

    if (!validator.isLength(code, { min: 6, max: 6 })) {
      throw new Error('Invalid OTP');
    }
  } catch (error) {
    console.error('Validation error:', error.message);
    throw error;
  }
};
