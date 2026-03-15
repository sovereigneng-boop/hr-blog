import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { isAuthenticated } from "../../../../lib/admin-auth";

export async function POST(request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof Blob)) {
      return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
    }

    const ext = (file.name || "").split(".").pop() || "jpg";
    const filename = `blog/img-${Date.now()}.${ext}`;

    const blob = await put(filename, file, {
      access: "public",
      addRandomSuffix: false,
    });

    return NextResponse.json({ url: blob.url });
  } catch (e) {
    return NextResponse.json({ error: e.message || "업로드 실패" }, { status: 500 });
  }
}
