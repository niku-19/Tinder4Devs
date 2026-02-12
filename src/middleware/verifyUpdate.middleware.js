export const verifyUpdateMiddleware = (allowedFields) => {
  return (request, response, next) => {
    try {
      const updateFields = Object.keys(request.body);

      const isValidUpdate = updateFields.every((field) =>
        allowedFields.includes(field),
      );

      if (!isValidUpdate) {
        throw new Error(
          `Invalid update! Allowed fields are: ${allowedFields.join(", ")}.`,
        );
      }

      next();
    } catch (error) {
      console.error(error);
      response.status(400).json({
        message: "Bad Request! Update are not valid.",
        error: error.message,
      });
    }
  };
};
