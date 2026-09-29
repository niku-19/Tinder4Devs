import { MATCHED_OR_REJECTED_STATUS } from '../constant/connectionRequest.constant.js';
import { SANITIZE_RESPONSE } from '../constant/sanitizeResponse.js';
import { Connection } from '../models/connection.schema.js';
import { Profile } from '../models/profile.schema.js';
import asyncHandler from '../utils/asyncHandler.utils.js';
import { validateCreateProfile } from '../utils/profile.utils.js';
import { sanitizeUser, sendResponse } from '../utils/sendResponse.utils.js';

export const createProfile = asyncHandler(async (request, response) => {
  validateCreateProfile(request);
  const {
    fullName,
    designation,
    experience,
    intent,
    bio,
    github,
    portfolio,
    techStack,
    interests,
    galleryImages,
  } = request.body;

  const userId = request.user?._id;
  console.log(userId);

  if (!userId) {
    return sendResponse(response, {
      statusCode: 400,
      message: 'User not found',
    });
  }

  const profileData = new Profile({
    userId,
    fullName,
    designation,
    experience,
    intent,
    bio,
    github,
    portfolio,
    techStack,
    interests,
    galleryImages,
  });

  const newProfile = await profileData.save();

  if (!newProfile) throw new Error('Error creating profile');

  return sendResponse(response, {
    statusCode: 201,
    message: 'Profile created successfully',
    data: sanitizeUser(newProfile),
  });
});

export const getProfile = asyncHandler(async (request, response) => {
  const loggedInUser = request.user;

  const profileData = await Profile.findOne({
    userId: loggedInUser._id,
  });

  if (!profileData) {
    return sendResponse(response, {
      statusCode: 404,
      message: 'Profile not found for this user',
    });
  }

  return sendResponse(response, {
    statusCode: 200,
    message: 'Profile fetched successfully',
    data: sanitizeUser(profileData),
  });
});

//* TODO: Discover Profile API
/*
 * 1. For now we will fetch all profile and send the frontend
 * 2. we will add limit and skip so that frontend can fetch limited user
 * 3. Future TODOS
 * 4. we will add features like :-
 *    a. filter the user which user ignore or rejected : //! Not DONE YET
 *    b. filter the user which is already connected : //! Not DONE YET
 *    c. filter the user which for the match request is already sent : //! Not DONE YET
 *    d. will add search filters based on tech stack and all : //! Not DONE YET
 *    e. most import filter our profile from our feed. means filter : //! Not DONE YET
 *       loggedIn user profile from the loggedIn user's feeds: //! Not DONE YET
 */
export const discoverProfiles = asyncHandler(async (request, response) => {
  const limit = Math.min(parseInt(request.query.limit) || 10, 50);
  const cursor = request.query.cursor;
  const query = {};
  const loggedInUserId = request.user?._id;

  const connectionRequests = await Connection.find({
    requestFromId: loggedInUserId,
    connectionStatus: { $nin: MATCHED_OR_REJECTED_STATUS },
  }).select('requestFromId requestToId');

  const hideUsersFromFeed = new Set();
  connectionRequests.forEach((req) => {
    hideUsersFromFeed.add(req.requestFromId.toString());
    hideUsersFromFeed.add(req.requestToId.toString());
  });

  if (cursor) {
    query._id = { $lt: cursor };
  }

  const usersProfiles = await Profile.find({
    ...query,
    $and: [
      { userId: { $nin: Array.from(hideUsersFromFeed) } },
      { userId: { $ne: loggedInUserId } },
    ],
  })
    .select(SANITIZE_RESPONSE)
    .sort({ _id: -1 })
    .limit(limit)
    .lean();

  if (!usersProfiles || usersProfiles.length === 0) {
    return sendResponse(response, {
      statusCode: 200,
      message: 'No profiles found',
      data: {
        profiles: [],
        nextCursor: null,
      },
    });
  }

  const nextCursor =
    usersProfiles.length === limit
      ? usersProfiles[usersProfiles.length - 1]._id
      : null;

  sendResponse(response, {
    statusCode: 200,
    message: 'Profiles fetched successfully',
    data: {
      discover: usersProfiles,
      nextCursor,
    },
  });
});
