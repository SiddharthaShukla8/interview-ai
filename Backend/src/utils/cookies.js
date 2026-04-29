const isProduction = process.env.NODE_ENV === "production";

const authCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000,
};

const authCookieClearOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
};

const sessionCookieOptions = {
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  httpOnly: true,
  maxAge: 10 * 60 * 1000,
};

module.exports = {
  authCookieClearOptions,
  authCookieOptions,
  sessionCookieOptions,
};
