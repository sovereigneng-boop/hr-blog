"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { CATEGORIES } from "../../../../lib/categories";
import { htmlToMarkdown } from "../../../../lib/htmlToMarkdown";

const TiptapEditor = dynamic(() => import("../../../../components/admin/TiptapEditor"), { ssr: false });

export default function NewPostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0].label);
  const [htmlContent, setHtmlContent] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

    const res = await fetch("/api/admin/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        category,
        content: markdown,
        tags: tags.length > 0 ? tags : undefined,
      }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) {
      setError(data.error || "저장 실패");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/admin" className="text-slate-500 hover:text-slate-700">← 목록</Link>
        <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-100">새 글 쓰기</h1>
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
            <TiptapEditor content={htmlContent} onChange={handleEditorChange} />
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button type="submit" disabled={saving}
            className="rounded-lg bg-[#0A2540] px-4 py-2 text-white font-medium hover:bg-[#0d3255] disabled:opacity-50">
            {saving ? "저장 중..." : "저장"}
          </button>
          <Link href="/admin" className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300">
            취소
          </Link>
        </div>
      </form>
    </div>
  );
}
