import mongoose from 'mongoose';
import validator from 'validator';
import bcrypt from 'bcrypt';
import { generateJsonWebToken } from '../utils/jwt.utils.js';
const { Schema } = mongoose;

const UsersSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      set: (value) => value.toLowerCase(),
      validator: (value) => {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email format');
        }
      },
    },
    authType: {
      type: String,
      enum: ['LOCAL', 'GOOGLE'],
      default: 'LOCAL',
      set: (value) => value.toUpperCase(),
      validator: (value) => {
        if (!['LOCAL', 'GOOGLE'].includes(value.toUpperCase())) {
          throw new Error('Auth Type must be either LOCAL or GOOGLE');
        }
      },
    },
    password: {
      type: String,
      required: function () {
        return this.authType === 'LOCAL';
      },
      validator: (value) => {
        if (!validator.isStrongPassword(value)) {
          throw new Error(
            'Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and symbols.'
          );
        }
      },
    },
    googleId: {
      type: String,
      default: '',
      required: function () {
        return this.authType === 'GOOGLE';
      },
    },
    profilePicture: {
      type: String,
      default: '',
      validator: (profilePicture) => {
        if (!validator.isURL(profilePicture)) {
          throw new Error('Invalid profile picture URL');
        }
      },
    },
    userStatus: {
      type: String,
      enum: ['ACTIVE', 'IN-ACTIVE'],
      default: 'ACTIVE',
      set: (value) => value.toUpperCase(),
      validator: (value) => {
        if (!['ACTIVE', 'IN-ACTIVE'].includes(value.toUpperCase())) {
          throw new Error('User Status must be either ACTIVE or IN-ACTIVE');
        }
      },
    },
    STATUS: {
      type: String,
      enum: ['NEW', 'DELETED'],
      default: 'NEW',
      set: (value) => value.toUpperCase(),
      validator: (value) => {
        if (!['NEW', 'DELETED'].includes(value.toUpperCase())) {
          throw new Error('User Status must be either ACTIVE or IN-ACTIVE');
        }
      },
    },
  },
  {
    timestamps: true,
  }
);

UsersSchema.methods.jwt = function () {
  try {
    const user = this;

    const payload = { _id: user._id };

    const token = generateJsonWebToken(payload);

    return token;
  } catch (error) {
    console.error('Error generating JWT:', error);
    throw new Error('Error generating JWT');
  }
};

UsersSchema.methods.refreshJwt = function () {
  try {
    const user = this;

    const payload = { _id: user._id };

    const token = generateJsonWebToken(payload, true);

    return token;
  } catch (error) {
    console.error('Error generating JWT:', error);
    throw new Error('Error generating JWT');
  }
};

UsersSchema.pre(/^find/, async function () {
  this.where('statusDeleted').ne('DELETED');
});

UsersSchema.pre('save', async function () {
  if (!this.isModified('password')) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    console.error('Error hashing password:', error);
  }
});

UsersSchema.methods.verifyPassword = async function (passwordGivenByUser) {
  try {
    const user = this;
    const passwordHash = user.password;

    const isPasswordValid = await bcrypt.compare(
      passwordGivenByUser,
      passwordHash
    );

    return isPasswordValid;
  } catch (error) {
    console.error('Error verifying password:', error);
    throw new Error('Error verifying password');
  }
};

export const Users = mongoose.model('Users', UsersSchema);
