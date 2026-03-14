import { cookies } from "next/headers";

const COOKIE_NAME = "admin-auth";
const COOKIE_MAX_AGE = 60 * 60 * 24;

function getExpectedToken() {
  const password = process.env.ADMIN_PASSWORD || "admin123";
  return Buffer.from(password + "-hr-blog-admin").toString("base64");
}

export function createAuthToken(password) {
  const expected = process.env.ADMIN_PASSWORD || "admin123";
  if (password !== expected) return null;
  return Buffer.from(password + "-hr-blog-admin").toString("base64");
}

export async function setAuthCookie(password) {
  const token = createAuthToken(password);
  if (!token) return false;
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return true;
}

export async function isAuthenticated() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return token === getExpectedToken();
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
