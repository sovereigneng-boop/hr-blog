"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/posts")
      .then((r) => {
        if (r.status === 401) { router.replace("/admin/login"); return []; }
        return r.json();
      })
      .then(setPosts)
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleDelete(slug, title) {
    if (!confirm(`"${title}" 글을 삭제하시겠습니까?`)) return;
    const res = await fetch(`/api/admin/posts/${slug}`, { method: "DELETE" });
    if (res.ok) setPosts((prev) => prev.filter((p) => p.slug !== slug));
    else alert("삭제 실패");
  }

  if (loading) return <p className="text-slate-500">로딩 중...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">글 목록</h1>
        <Link href="/admin/posts/new" className="rounded-lg bg-[#0A2540] px-4 py-2 text-sm font-medium text-white hover:bg-[#0d3255]">
          새 글 쓰기
        </Link>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
              <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">제목</th>
              <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">카테고리</th>
              <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">날짜</th>
              <th className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300 w-32">작업</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">등록된 글이 없습니다.</td></tr>
            ) : posts.map((post) => (
              <tr key={post.slug} className="border-b border-slate-100 dark:border-slate-700">
                <td className="px-4 py-3">
                  <Link href={`/posts/${post.slug}`} target="_blank" className="font-medium text-slate-800 hover:text-blue-600 dark:text-slate-200">
                    {post.title}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{post.category}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-400">{post.date}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/admin/posts/edit/${post.slug}`} className="text-blue-600 hover:underline">수정</Link>
                    <button onClick={() => handleDelete(post.slug, post.title)} className="text-red-600 hover:underline">삭제</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
