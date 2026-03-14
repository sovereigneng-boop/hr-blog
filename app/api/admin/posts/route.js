import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { isAuthenticated } from "../../../../lib/admin-auth";
import { CATEGORIES } from "../../../../lib/categories";

const postsDir = path.join(process.cwd(), "posts");

async function requireAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }
  return null;
}

export async function GET() {
  const err = await requireAuth();
  if (err) return err;

  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
  const posts = files.map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    const { data } = matter(fs.readFileSync(path.join(postsDir, fileName), "utf8"));
    return {
      slug,
      title: data.title,
      date: data.date,
      category: data.category,
      summary: data.summary || "",
      thumbnail: data.thumbnail || "",
      tags: data.tags || [],
    };
  });

  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return NextResponse.json(posts);
}

export async function POST(request) {
  const err = await requireAuth();
  if (err) return err;

  try {
    const { title, category, summary, thumbnail, content, tags } = await request.json();

    if (!title || !category) {
      return NextResponse.json({ error: "제목과 카테고리는 필수입니다." }, { status: 400 });
    }

    const cat = CATEGORIES.find((c) => c.label === category);
    if (!cat) {
      return NextResponse.json({ error: "올바른 카테고리를 선택해 주세요." }, { status: 400 });
    }

    const slug = slugify(title);
    const date = new Date().toISOString().slice(0, 10);
    const tagsLine = tags && tags.length > 0 ? `\ntags: [${tags.map((t) => `"${esc(t)}"`).join(", ")}]` : "";

    const md = `---
title: "${esc(title)}"
date: "${date}"
category: "${cat.label}"
summary: "${esc(summary || "")}"${thumbnail ? `\nthumbnail: "${thumbnail}"` : ""}${tagsLine}
---

${content || ""}
`;

    fs.writeFileSync(path.join(postsDir, `${slug}.md`), md, "utf8");
    return NextResponse.json({ success: true, slug });
  } catch (e) {
    return NextResponse.json({ error: e.message || "저장 실패" }, { status: 500 });
  }
}

function slugify(text) {
  const base = (text || "").trim().toLowerCase()
    .replace(/\s+/g, "-").replace(/[^\w가-힣\-]/g, "")
    .replace(/-+/g, "-").replace(/^-|-$/g, "");
  return base || `post-${Date.now()}`;
}

function esc(str) {
  return (str || "").replace(/"/g, '\\"');
}
