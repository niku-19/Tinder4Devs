import { sendResponse } from './sendResponse.utils.js';

const asyncHandler = (callbackFunction) => {
  return async (request, response, next) => {
    try {
      const result = await callbackFunction(request, response, next);
      return result;
    } catch (error) {
      return sendResponse(response, {
        statusCode: 500,
        message: error.message,
      });
    }
  };
};

export default asyncHandler;
