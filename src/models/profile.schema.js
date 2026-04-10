import mongoose from 'mongoose';
import validator from 'validator';

const { Schema } = mongoose;

const ProfileSchema = new Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
      unique: true, // A user should only have ONE profile
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 50,
    },
    designation: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
    },
    experience: {
      type: String,
      required: true,
      enum: {
        values: [
          'Student',
          'Junior (1-2 Years)',
          'Mid-Level (3-5 Years)',
          'Senior (5+ Years)',
          'Tech Lead',
          'System Architect',
          'CEO',
        ],
        message: '{VALUE} is not a valid experience level',
      },
    },
    intent: {
      type: String,
      required: true,
      trim: true,
    },
    bio: {
      type: String,
      required: true,
      trim: true,
      minLength: 10,
      maxLength: 500,
    },
    github: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || v.length > 0, // Optional but must be valid if present
        message: 'Invalid GitHub username',
      },
    },
    portfolio: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || validator.isURL(v),
        message: 'Please provide a valid portfolio URL',
      },
    },
    techStack: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'Tech stack cannot be empty',
      },
    },
    interests: {
      type: [String],
      required: true,
      validate: {
        validator: (v) => Array.isArray(v) && v.length > 0,
        message: 'Interests cannot be empty',
      },
    },
    galleryImages: {
      type: [String],
      validate: {
        validator: (v) => Array.isArray(v) && v.length >= 2,
        message: 'You must upload at least 2 gallery images',
      },
    },
    profileStatus: {
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
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Create index for faster searching by tech stack later
ProfileSchema.index({ techStack: 1 });

export const Profile = mongoose.model('Profile', ProfileSchema);
