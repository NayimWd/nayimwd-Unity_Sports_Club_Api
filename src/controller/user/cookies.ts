export const cookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

export const refreshCookieOptions = {
  httpOnly: true,
  secure: true,
  sameSite: "none" as const,
  maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
};
