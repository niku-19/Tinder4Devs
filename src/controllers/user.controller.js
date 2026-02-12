import { User } from "../models/user.schema.js";
import { generateJsonWebToken } from "../utils/jwt.utils.js";
import {
  validateRegisterUser,
  validateSignInUser,
} from "../utils/user.util.js";
import bcrypt from "bcrypt";

export const signUp = async (request, response) => {
  try {
    //validate the user data
    validateRegisterUser(request.body);

    const userData = request.body;
    const newUser = new User(userData);

    await newUser.save();

    response.status(201).json({
      message: "User signed up successfully",
      user: newUser?._id,
    });
  } catch (error) {
    console.error("Error in signUp controller:", error);
    response.status(500).json({
      message: "An error occurred during sign-up. Please try again later.",
      error: error.message,
    });
  }
};

export const signIn = async (request, response) => {
  try {
    validateSignInUser(request.body);
    const { email, password } = request.body;

    //check if email exits or not.
    const user = await User.findOne({ email });

    if (!user) {
      return response.status(404).json({
        message: "User not found with the provided email",
      });
    }

    //check if the password is correct or not.
    const isPasswordMatch = await bcrypt.compare(password, user.password);

    if (!isPasswordMatch) {
      return response.status(401).json({
        message: "Invalid password",
      });
    }

    // here we will call create a JWT token function
    const token = generateJsonWebToken({ _id: user._id });

    //we will create a cookies
    response.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    response.status(200).json({
      message: "User signed in successfully",
      user: user._id,
    });
  } catch (error) {
    console.error("Error in signIn controller:", error);
    response.status(500).json({
      message: "An error occurred during sign-in. Please try again later.",
      error: error.message,
    });
  }
};

export const users = async (request, response) => {
  try {
    //here we find all the users and return them in the response
    const users = await User.find({}).sort({ createdAt: -1 });

    //check if users are found
    if (!users || users.length === 0) {
      return response.status(404).json({
        message: "No users found",
      });
    }

    response.status(200).json({
      message: "Users fetched successfully",
      users,
    });
  } catch (error) {
    console.error("Error in users controller:", error);
    response.status(500).json({
      message:
        "An error occurred while fetching users. Please try again later.",
      error: error.message,
    });
  }
};

export const userById = async (request, response) => {
  try {
    //fetch the user id from the request params
    const userId = request.params.id;

    //find the user by id
    const user = await User.findById(userId);

    //check if user is found
    if (!user) {
      return response.status(404).json({
        message: "User not found",
      });
    }

    response.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error in userById controller:", error);
    response.status(500).json({
      message:
        "An error occurred while fetching user details. Please try again later.",
      error: error.message,
    });
  }
};

export const userByEmail = async (request, response) => {
  try {
    const email = request.params.email;
    const user = await User.findOne({ email });
    if (!user) {
      return response.status(404).json({
        message: "User not found",
      });
    }
    response.status(200).json({
      message: "User fetched successfully",
      user,
    });
  } catch (error) {
    console.error("Error in userByEmail controller:", error);
    res.status(500).json({
      message:
        "An error occurred while fetching user details. Please try again later.",
      error: error.message,
    });
  }
};

export const deleteUser = async (request, response) => {
  try {
    //getting the user id from the request params
    const userId = request.params.id;
    //we are doing a soft delete here, so we are not deleting the user from the database, instead we  are
    //updating the statusDeleted field to DELETED
    //finding the user by id and updating the statusDeleted field to DELETED

    const deletedUser = await User.findByIdAndUpdate(
      userId,
      { statusDeleted: "DELETED" },
      { new: true, timestamps: true },
    );

    //check if user is found and updated
    if (!deletedUser) {
      return response.status(404).json({
        message: "User not found",
      });
    }

    response.status(200).json({
      message: "User deleted successfully",
      user: deletedUser,
    });
  } catch (error) {
    console.error("Error in deleteUser controller:", error);
    response.status(500).json({
      message:
        "An error occurred while deleting the user. Please try again later.",
      error: error.message,
    });
  }
};

export const updateUser = async (request, response) => {
  try {
    const userId = request.params.id;
    const updateData = request.body;

    //check if update data is provided
    if (!updateData || Object.keys(updateData).length === 0) {
      return response.status(400).json({
        message: "No update data provided",
      });
    }

    //find the user and update the user details.
    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      timestamps: true,
    });

    //check if user is found and updated
    if (!updatedUser) {
      return response.status(404).json({
        message: "User not found",
      });
    }

    response.status(200).json({
      message: "User updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateUser controller:", error);
    response.status(500).json({
      message:
        "An error occurred while updating the user. Please try again later.",
      error: error.message,
    });
  }
};
