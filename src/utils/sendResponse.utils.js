export const sendResponse = (
  response,
  { statusCode = 200, message = 'Success', data = null }
) => {
  return response.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sanitizeUser = (user) => {
  const obj = user.toObject();
  delete obj.password;
  delete obj.__v;
  return obj;
};
