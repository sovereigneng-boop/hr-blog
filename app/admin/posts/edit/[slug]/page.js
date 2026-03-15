"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { CATEGORIES } from "../../../../../lib/categories";
import { htmlToMarkdown } from "../../../../../lib/htmlToMarkdown";

const TiptapEditor = dynamic(() => import("../../../../../components/admin/TiptapEditor"), { ssr: false });

function markdownToBasicHtml(md) {
  if (!md) return "";
  let html = md;
  html = html.replace(/^#### (.+)$/gm, "<h4>$1</h4>");
  html = html.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  html = html.replace(/^## (.+)$/gm, "<h2>$1</h2>");
  html = html.replace(/^# (.+)$/gm, "<h1>$1</h1>");
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/\*(.+?)\*/g, "<em>$1</em>");
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1" />');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  const blocks = html.split(/\n\n+/);
  html = blocks
    .map((block) => {
      block = block.trim();
      if (!block) return "";
      if (/^<(h[1-6]|ul|ol|li|blockquote|img|p|div|table|hr|pre)/.test(block)) return block;
      const lines = block.split("\n");
      const isList = lines.every((l) => /^[-*] /.test(l.trim()));
      if (isList) {
        const items = lines.map((l) => `<li>${l.replace(/^[-*] /, "").trim()}</li>`).join("");
        return `<ul>${items}</ul>`;
      }
      const isOrdered = lines.every((l) => /^\d+\. /.test(l.trim()));
      if (isOrdered) {
        const items = lines.map((l) => `<li>${l.replace(/^\d+\. /, "").trim()}</li>`).join("");
        return `<ol>${items}</ol>`;
      }
      return `<p>${block.replace(/\n/g, "<br>")}</p>`;
    })
    .join("\n");
  return html;
}

export default function EditPostPage() {
  const router = useRouter();
  const { slug } = useParams();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [htmlContent, setHtmlContent] = useState("");
  const [date, setDate] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editorReady, setEditorReady] = useState(false);

  useEffect(() => {
    fetch(`/api/admin/posts/${slug}`)
      .then((r) => {
        if (r.status === 401) router.replace("/admin/login");
        return r.json();
      })
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setTitle(data.title || "");
          setCategory(data.category || CATEGORIES[0].label);
          setDate(data.date || "");
          setTags(data.tags || []);
          setHtmlContent(markdownToBasicHtml(data.content || ""));
          setEditorReady(true);
        }
      })
      .catch(() => setError("글을 불러올 수 없습니다."))
      .finally(() => setLoading(false));
  }, [slug, router]);

  const handleEditorChange = useCallback((html) => setHtmlContent(html), []);

  function addTag() {
    const t = tagInput.trim().replace(/^#/, "");
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput("");
  }

  function removeTag(tag) {
    setTags(tags.filter((t) => t !== tag));
  }

  function handleTagKeyDown(e) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const markdown = htmlToMarkdown(htmlContent);

    const res = await fetch(`/api/admin/posts/${slug}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        category,
        content: markdown,
        date,
        tags: tags.length > 0 ? tags : undefined,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "수정 실패");
      return;
    }
    if (data.slug && data.slug !== slug) {
      router.replace(`/admin/posts/edit/${data.slug}`);
    }
    router.refresh();
    alert("저장 완료!");
  }

  if (loading) return <p className="text-slate-500">로딩 중...</p>;

  if (error && !title) {
    return (
      <div className="space-y-4">
        <Link href="/admin" className="text-blue-600 hover:underline">← 목록으로</Link>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="text-slate-500 hover:text-slate-700">← 목록</Link>
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">글 수정</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">제목</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="글 제목"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">카테고리</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100">
            {CATEGORIES.map((c) => <option key={c.slug} value={c.label}>{c.displayLabel ?? c.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">해시태그</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                #{tag}
                <button type="button" onClick={() => removeTag(tag)} className="text-blue-600 hover:text-red-600">×</button>
              </span>
            ))}
          </div>
          <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagKeyDown}
            placeholder="태그 입력 후 Enter"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">본문</label>
            <button type="button" onClick={() => setShowPreview(!showPreview)} className="text-sm text-blue-600 hover:underline">
              {showPreview ? "편집 모드" : "미리보기"}
            </button>
          </div>
          {showPreview ? (
            <div className="rounded-lg border border-slate-200 bg-white p-4 min-h-[300px] dark:border-slate-600 dark:bg-slate-800">
              <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-1">{title || "(제목 없음)"}</h1>
              <p className="text-sm text-slate-500 mb-4">{category}</p>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {tags.map((t) => <span key={t} className="text-xs text-blue-600">#{t}</span>)}
                </div>
              )}
              <div className="prose prose-slate dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: htmlContent || "<p><em>내용이 없습니다.</em></p>" }} />
            </div>
          ) : (
            editorReady && <TiptapEditor content={htmlContent} onChange={handleEditorChange} />
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="rounded-lg bg-[#0A2540] px-4 py-2 text-white font-medium hover:bg-[#0d3255] disabled:opacity-50">
            {saving ? "저장 중..." : "수정 저장"}
          </button>
          <Link href="/admin" className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300">
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
