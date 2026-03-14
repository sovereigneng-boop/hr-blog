import { NextResponse } from "next/server";
import { setAuthCookie } from "../../../../lib/admin-auth";

export async function POST(request) {
  try {
    const { password } = await request.json();
    const ok = await setAuthCookie(password);
    if (!ok) {
      return NextResponse.json({ error: "잘못된 비밀번호입니다." }, { status: 401 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "오류가 발생했습니다." }, { status: 500 });
  }
}
