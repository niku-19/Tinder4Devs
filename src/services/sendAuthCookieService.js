import { setAuthRefreshTokenRedis } from '../redis/auth.redis.js';

export const sendAuthCookie = async (
  response,
  schemaModal,
  removedPrevCookies = false
) => {
  try {
    const maxAgeOfCookies = parseInt(process.env.MAX_AGE_OF_COOKIE || '900000');
    const maxAgeOfRefreshCookies = parseInt(
      process.env.MAX_AGE_OF_REFRESH_COOKIE || '604800000'
    );
    const nameOfToken = process.env.NAME_OF_TOKEN;
    const nameOfRefreshToken = process.env.NAME_OF_REFRESH_TOKEN;

    if (removedPrevCookies) {
      response.clearCookie(nameOfToken, null, {
        httpOnly: true,
        secure: process.env.CURRENT_ENV === process.env.PRODUCTION,
        sameSite: 'strict',
        maxAge: 0,
        expireIn: new Date(Date.now()),
      });

      response.clearCookie(nameOfRefreshToken, null, {
        httpOnly: true,
        secure: process.env.CURRENT_ENV === process.env.PRODUCTION,
        sameSite: 'strict',
        maxAge: 0,
        expireIn: new Date(Date.now()),
      });
    }

    const token = schemaModal.jwt();
    const refreshToken = schemaModal.refreshJwt();

    console.log(schemaModal?.email, { schemaModal });

    response.cookie(nameOfToken, token, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: maxAgeOfCookies,
    });

    response.cookie(nameOfRefreshToken, refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      maxAge: maxAgeOfRefreshCookies,
    });

    await setAuthRefreshTokenRedis(
      refreshToken,
      maxAgeOfRefreshCookies,
      schemaModal?.email
    );

    return token;
  } catch (error) {
    console.error('Error in sendAuthCookie:', error);
    throw new Error(
      `An error occurred while sending the auth cookie. Please try again later. Error details: ${error.message}`
    );
  }
};
