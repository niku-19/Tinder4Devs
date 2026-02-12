export const environmentConfigValue = () => {
  const isProduction = process.env.CURRENT_ENV === process.env.PRODUCTION;
  const jwt_secret = isProduction
    ? process.env.JWT_SECRET_PRODUCTION
    : process.env.JWT_SECRET_DEVELOPMENT;

  return {
    jwt_secret,
  };
};
