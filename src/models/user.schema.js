import mongoose, { set } from "mongoose";
const { Schema } = mongoose;
import bcrypt from "bcrypt";
import validator from "validator";

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 20,
    },
    lastName: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 20,
    },
    age: {
      type: Number,
      required: true,
      index: true,
      min: 18,
      max: 100,
      ValidityState: {
        validator: function (value) {
          return value >= 18 && value <= 100;
        },
        message: "Age must be between 18 and 100",
      },
    },
    contactNumber: {
      type: String,
      required: true,
      unique: true,
      validator(value) {
        if (!validator.isMobilePhone(value, "any")) {
          throw new Error("Invalid contact number format");
        }
      },
    },
    email: {
      type: String,
      required: true,
      unique: true,
      set: (value) => value.toLowerCase(),
      validator(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email format");
        }
      },
    },
    password: {
      type: String,
      required: true,
      validator(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error(
            "Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and symbols.",
          );
        }
      },
    },
    profilePicture: {
      type: String,
      default: "https://pixabay.com/images/search/profile%20icon/",
      validator(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid URL format for profile picture");
        }
      },
    },
    coverPicture: {
      type: String,
      default: "https://unsplash.com/s/photos/cover-photo",
      validator(value) {
        if (!validator.isURL(value)) {
          throw new Error("Invalid URL format for cover picture");
        }
      },
    },
    bio: {
      type: String,
      max: 50,
      default: "This is default bio from the system",
      minLength: 10,
      maxLength: 300,
    },
    location: {
      type: String,
      max: 50,
    },
    primaryRole: {
      type: String,
      required: true,
      minLength: 3,
      maxLength: 30,
    },
    yearsOfExperience: {
      type: Number,
      required: true,
      min: 0,
      max: 80,
    },
    skills: {
      type: [String],
      required: true,
      validator(value) {
        if (!Array.isArray(value) || value.length === 0) {
          throw new Error("Skills must be a non-empty array of strings");
        }

        if (
          value.some(
            (skill) => typeof skill !== "string" || skill.trim() === "",
          )
        ) {
          throw new Error("Each skill must be a non-empty string");
        }

        if (value.length > 20) {
          throw new Error("A maximum of 20 skills can be added");
        }
      },
    },
    socialLinks: {
      type: Map,
      of: String,
      validator(value) {
        for (const [platform, url] of value.entries()) {
          if (!validator.isURL(url)) {
            throw new Error(`Invalid URL format for ${platform} link`);
          }
        }
      },
    },
    collaborationStyle: {
      type: String,
      enum: ["Remote", "In-Person", "Hybrid"],
      validator(value) {
        if (!["Remote", "In-Person", "Hybrid"].includes(value)) {
          throw new Error(
            "Collaboration style must be one of: Remote, In-Person, Hybrid",
          );
        }
      },
    },
    statusDeleted: {
      type: String,
      default: "NEW",
      enum: ["NEW", "DELETED"],
      set: (value) => value.toUpperCase(),
      index: true,
      validator(value) {
        if (!["NEW", "DELETED"].includes(value.toUpperCase())) {
          throw new Error("Status must be either NEW or DELETED");
        }
      },
    },
  },
  {
    timestamps: true,
  },
);

userSchema.pre(/^find/, async function () {
  this.where("statusDeleted").ne("DELETED");
});

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    console.error("Error hashing password:", error);
  }
});

export const User = mongoose.model("User", userSchema);
