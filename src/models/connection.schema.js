import mongoose from 'mongoose';
import validator from 'validator';
import {
  CONNECTION_STATUS,
  VALID_CONNECTION_REQUEST_STATUS,
} from '../constant/connectionRequest.constant.js';

const { Schema } = mongoose;

const ConnectionSchema = new Schema(
  {
    requestFromId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    requestToId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    requestFromStatus: {
      type: String,
      enum: VALID_CONNECTION_REQUEST_STATUS,
      validator: (value) => {
        if (!VALID_CONNECTION_REQUEST_STATUS.includes(value.toUpperCase())) {
          throw new Error(`${value} is not a valid request status.`);
        }
      },
    },
    requestToStatus: {
      type: String,
      enum: VALID_CONNECTION_REQUEST_STATUS,
      validator: (value) => {
        if (!VALID_CONNECTION_REQUEST_STATUS.includes(value.toUpperCase())) {
          throw new Error(`${value} is not a valid request status.`);
        }
      },
    },
    connectionStatus: {
      type: String,
      enum: CONNECTION_STATUS,
      default: 'PENDING',
      validator: (value) => {
        if (!CONNECTION_STATUS.includes(value.toUpperCase())) {
          throw new Error(`${value} is not a valid connection status.`);
        }
      },
    },
  },
  {
    timestamps: true,
  }
);

ConnectionSchema.index({ requestFromId: 1, requestToId: 1 }, { unique: true });

ConnectionSchema.pre('save', async function () {
  try {
    const connection = this;

    if (
      connection.requestFromId.toString() === connection.requestToId.toString()
    ) {
      throw new Error('A user cannot send a connection request to themselves.');
    }
  } catch (error) {
    console.error('Error in pre-save hook of ConnectionSchema:', error);
    throw error;
  }
});

export const Connection = mongoose.model('Connection', ConnectionSchema);
