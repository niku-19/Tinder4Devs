import { VALID_CONNECTION_REQUEST_STATUS } from '../constant/connectionRequest.constant.js';

export const validateConnectionRequest = (request) => {
  try {
    const { status, userId } = request.params;

    if (!status || !userId) {
      return sendResponse(response, {
        statusCode: 400,
        message: 'Bad Request, Status and UserId is required.',
      });
    }

    if (!VALID_CONNECTION_REQUEST_STATUS.includes(status)) {
      return sendResponse(response, {
        statusCode: 400,
        message: `Invalid Status, Please provide valid status ${status}`,
      });
    }

    return { status, userId };
  } catch (error) {
    console.error('Error validating connection request:', error);
    throw new Error('Invalid connection request.');
  }
};
