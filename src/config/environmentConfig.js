export const environmentConfigValue = (isRefreshToken = false) => {
  const isProduction = process.env.CURRENT_ENV === process.env.PRODUCTION;
  const jwt_secret = isProduction
    ? process.env.JWT_SECRET_PRODUCTION
    : process.env.JWT_SECRET_DEVELOPMENT;

  const jwt_refresh_secret = isProduction
    ? process.env.JWT_REFRESH_SECRET_PRODUCTION
    : process.env.JWT_REFRESH_SECRET_DEVELOPMENT;

  return {
    jwt_secret,
    jwt_refresh_secret,
  };
};
