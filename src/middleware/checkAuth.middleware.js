import jwt from 'jsonwebtoken';
import { environmentConfigValue } from '../config/environmentConfig.js';
import { Users } from '../models/users.schema.js';
import { sendResponse } from '../utils/sendResponse.utils.js';

export const checkAuth = async (request, response, next) => {
  try {
    const token = request.cookies.TOKEN;

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

    const user = await Users.findById(userId);

    if (!user) {
      throw new Error('User not found in database.');
    }

    // Attach user object to request for further use in routes
    request.user = user;
    next();
  } catch (error) {
    console.error('Error in checkAuth middleware:', error);
    return sendResponse(response, {
      statusCode: 401,
      message: 'Unauthorized! Please log in to access this resource.',
    });
  }
};
