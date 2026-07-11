export const AUTH_COOKIE = {
  ACCESS_TOKEN: "sb-access-token",
  ROLE: "sb-user-role",
  USER_ID: "sb-user-id",
};

export const COOKIE_OPTIONS = {
  path: "/",
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};
