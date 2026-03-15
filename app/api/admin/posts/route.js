import { NextResponse } from "next/server";
import { isAuthenticated } from "../../../../lib/admin-auth";
import { CATEGORIES } from "../../../../lib/categories";
import { getAllPosts, savePost } from "../../../../lib/posts-kv";

async function requireAuth() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "인증이 필요합니다." }, { status: 401 });
  }
  return null;
}

function getFirstImageUrlFromContent(content) {
  if (!content || typeof content !== "string") return null;
  const imgTag = content.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (imgTag) return imgTag[1];
  const mdImg = content.match(/!\[[^\]]*\]\(([^)]+)\)/);
  return mdImg ? mdImg[1] : null;
}

export async function GET() {
  const err = await requireAuth();
  if (err) return err;

  const posts = await getAllPosts();
  return NextResponse.json(posts);
}

export async function POST(request) {
  const err = await requireAuth();
  if (err) return err;

  try {
    const { title, category, content, tags } = await request.json();

    if (!title || !category) {
      return NextResponse.json({ error: "제목과 카테고리는 필수입니다." }, { status: 400 });
    }

    const cat = CATEGORIES.find((c) => c.label === category);
    if (!cat) {
      return NextResponse.json({ error: "올바른 카테고리를 선택해 주세요." }, { status: 400 });
    }

    const slug = slugify(title);
    const date = new Date().toISOString().slice(0, 10);
    const thumbnail = getFirstImageUrlFromContent(content);

    await savePost(slug, {
      title,
      date,
      category: cat.label,
      summary: "",
      thumbnail: thumbnail ?? null,
      tags: tags || [],
      content: content || "",
    });

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
