import { NextResponse } from "next/server";
import { isAuthenticated } from "../../../../../lib/admin-auth";
import { CATEGORIES } from "../../../../../lib/categories";
import { getPostRaw, savePost, deletePost } from "../../../../../lib/posts-kv";

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

export async function GET(request, { params }) {
  const err = await requireAuth();
  if (err) return err;

  const data = await getPostRaw(params.slug);
  if (!data) {
    return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({
    slug: data.slug,
    title: data.title,
    date: data.date,
    category: data.category,
    summary: data.summary || "",
    thumbnail: data.thumbnail || "",
    tags: data.tags || [],
    content: data.content || "",
  });
}

export async function PUT(request, { params }) {
  const err = await requireAuth();
  if (err) return err;

  try {
    const { title, category, content, date, tags } = await request.json();
    const slug = params.slug;

    if (!title || !category) {
      return NextResponse.json({ error: "제목과 카테고리는 필수입니다." }, { status: 400 });
    }

    const cat = CATEGORIES.find((c) => c.label === category);
    if (!cat) {
      return NextResponse.json({ error: "올바른 카테고리를 선택해 주세요." }, { status: 400 });
    }

    const d = date || new Date().toISOString().slice(0, 10);
    const thumbnail = getFirstImageUrlFromContent(content);

    await savePost(slug, {
      title,
      date: d,
      category: cat.label,
      summary: "",
      thumbnail: thumbnail ?? null,
      tags: tags || [],
      content: content || "",
    });

    return NextResponse.json({ success: true, slug });
  } catch (e) {
    return NextResponse.json({ error: e.message || "수정 실패" }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const err = await requireAuth();
  if (err) return err;

  const data = await getPostRaw(params.slug);
  if (!data) {
    return NextResponse.json({ error: "글을 찾을 수 없습니다." }, { status: 404 });
  }

  await deletePost(params.slug);
  return NextResponse.json({ success: true });
}
