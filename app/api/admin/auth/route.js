import { NextResponse } from "next/server";
import { isAuthenticated, clearAuthCookie } from "../../../../lib/admin-auth";

export async function GET() {
  const auth = await isAuthenticated();
  return NextResponse.json({ authenticated: auth });
}

export async function DELETE() {
  await clearAuthCookie();
  return NextResponse.json({ success: true });
}
