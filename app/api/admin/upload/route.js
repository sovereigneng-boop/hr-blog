import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { isAuthenticated } from "../../../../lib/admin-auth";

const uploadDir = path.join(process.cwd(), "public", "uploads");

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

    const ext = path.extname(file.name || "") || ".jpg";
    const name = `img-${Date.now()}${ext}`;
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(uploadDir, name), buffer);

    return NextResponse.json({ url: `/uploads/${name}` });
  } catch (e) {
    return NextResponse.json({ error: e.message || "업로드 실패" }, { status: 500 });
  }
}
