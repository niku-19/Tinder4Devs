import { sendResponse } from '../utils/sendResponse.utils.js';

export const MAX_REQUESTS_ALLOWED = 5;
export const WINDOW_MS = 60 * 1000;

/**
 * for example
 * {
 *  ip: {
 *    requests: 0,
 *    windowResetTime: 0
 *  }
 */

export const rateLimiterMiddleware = ({
  maxRequestsAllowed = MAX_REQUESTS_ALLOWED,
  windowMs = WINDOW_MS,
}) => {
  const users = new Map();
  return (request, response, next) => {
    const key = request.ip;
    const currentTime = Date.now();
    console.log('key', key);

    let user = users.get(key);
    console.log('user', user);

    /**
     * here we have to handle three cases.
     * 1. If the client hit the api for the first time,
     * 2. if the client hit the api for the max times allowed,
     * 3. reset the time window after the time window has passed.
     */

    //for the first time
    if (!user) {
      user = {
        requests: 1,
        windowResetTime: currentTime + windowMs,
      };

      users.set(key, user);
      return next();
    }

    //for time expired and reset the map
    if (currentTime >= user.windowResetTime) {
      user.requests = 1;
      user.windowResetTime = currentTime + windowMs;

      return next();
    }

    //limit exceeded
    if (user && user.requests > maxRequestsAllowed) {
      return sendResponse(response, {
        statusCode: 429,
        message: 'Too Many Request',
      });
    }

    if (user) user.requests += 1;
    next();
  };
};
