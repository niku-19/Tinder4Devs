import jwt from 'jsonwebtoken';
import { User } from '../models/user.schema.js';
import { environmentConfigValue } from '../config/environmentConfig.js';

export const checkAuth = async (request, response, next) => {
  try {
    const token = request.cookies.token;

    if (!token) {
      throw new Error(
        'No Token provided! Please log in to access this resource.'
      );
    }

    //checking the secret key based on the environment
    const { jwt_secret } = environmentConfigValue();

    //verify the token and decode it to get the user information
    const decoded = jwt.verify(token, jwt_secret);

    // takin the user id from the decoded obj.
    const userId = decoded._id;

    //we will find the user in the database and check if the user exists
    if (!userId) {
      throw new Error('Invalid token! User not found.');
    }

    const user = await User.findById(userId);

    if (!user) {
      throw new Error('User not found in database.');
    }

    // Attach user object to request for further use in routes
    request.user = user;
    next();
  } catch (error) {
    console.error('Error in checkAuth middleware:', error);
    response.status(401).json({
      message: 'Unauthorized! Please log in to access this resource.',
      error: error.message,
    });
  }
};
