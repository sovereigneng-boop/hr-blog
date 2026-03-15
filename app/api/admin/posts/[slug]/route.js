import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { isAuthenticated } from "../../../../../lib/admin-auth";
import { CATEGORIES } from "../../../../../lib/categories";

const postsDir = path.join(process.cwd(), "posts");

async function requireAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }
  return null;
}

export async function GET(request, { params }) {
  const err = await requireAuth();
  if (err) return err;

  const filePath = path.join(postsDir, `${params.slug}.md`);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });
  }

  const { data, content } = matter(fs.readFileSync(filePath, "utf8"));
  return NextResponse.json({
    slug: params.slug,
    title: data.title,
    date: data.date,
    category: data.category,
    summary: data.summary || "",
    thumbnail: data.thumbnail || "",
    tags: data.tags || [],
    content: content.trim(),
  });
}

export async function PUT(request, { params }) {
  const err = await requireAuth();
  if (err) return err;

  try {
    const { title, category, summary, thumbnail, content, date, tags } = await request.json();
    const oldSlug = params.slug;

    if (!title || !category) {
      return NextResponse.json({ error: "제목과 카테고리는 필수입니다." }, { status: 400 });
    }

    const cat = CATEGORIES.find((c) => c.label === category);
    if (!cat) {
      return NextResponse.json({ error: "올바른 카테고리를 선택해 주세요." }, { status: 400 });
    }

    const d = date || new Date().toISOString().slice(0, 10);
    const tagsLine = tags && tags.length > 0 ? `\ntags: [${tags.map((t) => `"${esc(t)}"`).join(", ")}]` : "";

    const md = `---
title: "${esc(title)}"
date: "${d}"
category: "${cat.label}"
summary: "${esc(summary || "")}"${thumbnail ? `\nthumbnail: "${thumbnail}"` : ""}${tagsLine}
---

${content || ""}
`;

    const filePath = path.join(postsDir, `${oldSlug}.md`);
    fs.writeFileSync(filePath, md, "utf8");
    return NextResponse.json({ success: true, slug: oldSlug });
  } catch (e) {
    return NextResponse.json({ error: e.message || "수정 실패" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const err = await requireAuth();
  if (err) return err;

  const filePath = path.join(postsDir, `${params.slug}.md`);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });
  }
  fs.unlinkSync(filePath);
  return NextResponse.json({ success: true });
}

function esc(str) {
  return (str || "").replace(/"/g, '\\"');
}
