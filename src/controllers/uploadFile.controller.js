import { uploadToCloudinary } from '../services/cloudinaryService.js';
import asyncHandler from '../utils/asyncHandler.utils.js';
import { sendResponse } from '../utils/sendResponse.utils.js';

export const uploadSingleImage = asyncHandler(async (request, response) => {
  console.log('running');
  console.log('--- UPLOAD DEBUG ---');
  // console.log('Headers:', request.headers['content-type']);
  console.log('Body:', request.body); // Should be empty for multipart until parsed
  // console.log('File:', request.file); // The culprit
  if (!request.file) {
    return sendResponse(response, {
      statusCode: 400,
      message: 'No file uploaded',
    });
  }

  const file = request.file;
  const userId = request.user?._id;
  console.log('running', file, userId);
  const folder = `profile/${userId}`;
  const result = await uploadToCloudinary(file.buffer, folder);

  if (!result) {
    return sendResponse(response, {
      statusCode: 500,
      message: 'Error uploading file',
    });
  }

  return sendResponse(response, {
    statusCode: 200,
    message: 'File uploaded successfully',
    data: {
      url: result.secure_url,
      public_id: result.public_id,
    },
  });
});
