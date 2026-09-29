import asyncHandler from '../utils/asyncHandler.utils.js';
import { sendResponse } from '../utils/sendResponse.utils.js';
import { Users } from '../models/users.schema.js';
import { Connection } from '../models/connection.schema.js';
import {
  LIKE,
  MATCHED,
  PENDING,
  REJECTED,
} from '../constant/connectionRequest.constant.js';
import { validateConnectionRequest } from '../utils/connection.utils.js';

/**
 * Note :- /connection/:status/:userId
 * 1. First of all we validate the status
 * 2. Then we validate the userId
 * 3. then check our connection request
 *    if connection request is found from both side then its a match (later we push ws notification based on that we show a match found ui)
 *    else we create request and wait other to send or accept the request.
 */
export const connectionRequest = asyncHandler(async (request, response) => {
  const { status, userId } = validateConnectionRequest(request);
  const loggedInUser = request.user;

  if (loggedInUser?._id.toString() === userId.toString()) {
    return sendResponse(response, {
      statusCode: 400,
      message: "You can't send connection request to yourself.",
    });
  }

  const isValidUserId = await Users.findById(userId);

  if (!isValidUserId) {
    return sendResponse(response, {
      statusCode: 404,
      message: 'User Is not found',
    });
  }

  /**
   * 1. check if there is already a connection request exits.
   * 2. check if logged in user send it or received the request.
   */

  const isConnectionRequestExits = await Connection.findOne({
    $or: [
      {
        requestFromId: loggedInUser._id,
        requestToId: userId,
      },
      {
        requestFromId: userId,
        requestToId: loggedInUser._id,
      },
    ],
  });

  /**
   * 1. If connection request is does not exits then we create a new connection request.
   * 2. If connection request is exits then we check the request from status of the user.
   * 3. If the request form status is LIKE and the current status is also LIKE then its a match.
   * 4. Else we will just update the connection request with the requestToStatus and connection status.
   * 5. will update the requestToStatus to the status and connection status based on the status.
   */

  if (isConnectionRequestExits) {
    const { requestFromStatus, connectionStatus } = isConnectionRequestExits;

    /**
     * 1. This is additional check to avoid the user to send the request again:-
     * 2. if the request is  already for the same user.
     * 3. if the request is already been matched or rejected.
     */

    if (connectionStatus === MATCHED || connectionStatus === REJECTED) {
      return sendResponse(response, {
        statusCode: 400,
        message: `Connection request is already ${connectionStatus.toLowerCase()}.`,
      });
    }

    if (
      isConnectionRequestExits.requestFromId.toString() ===
      loggedInUser._id.toString()
    ) {
      return sendResponse(response, {
        statusCode: 400,
        message: `You have already sent a connection request to this user.`,
      });
    }

    if (requestFromStatus === LIKE && status === LIKE) {
      const updatedConnectionRequest = await Connection.findByIdAndUpdate(
        isConnectionRequestExits._id,
        {
          requestToStatus: status,
          connectionStatus: MATCHED,
        },
        { new: true, timestamps: true }
      );

      return sendResponse(response, {
        statusCode: 200,
        message: 'Its a match! Connection request accepted successfully.',
        data: updatedConnectionRequest,
      });
    } else {
      const updatedConnectionRequest = await Connection.findByIdAndUpdate(
        isConnectionRequestExits._id,
        {
          requestToStatus: status,
          connectionStatus: REJECTED,
        },
        { new: true, timestamps: true }
      );

      return sendResponse(response, {
        statusCode: 200,
        message: `Connection request ${
          status === REJECTED ? 'rejected' : 'updated'
        } successfully.`,
        data: updatedConnectionRequest,
      });
    }
  }

  const newConnectionRequest = new Connection({
    requestFromId: loggedInUser._id,
    requestToId: userId,
    requestFromStatus: status,
    connectionStatus: PENDING,
  });

  await newConnectionRequest.save();

  return sendResponse(response, {
    statusCode: 200,
    message: 'Connection request sent successfully.',
    data: newConnectionRequest,
  });
});
