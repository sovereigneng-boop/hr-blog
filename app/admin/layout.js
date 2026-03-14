"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [auth, setAuth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/auth")
      .then((r) => r.json())
      .then((d) => {
        setAuth(d.authenticated);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [pathname]);

  useEffect(() => {
    if (loading) return;
    if (!auth && pathname !== "/admin/login") {
      router.replace("/admin/login");
    }
  }, [auth, loading, pathname, router]);

  async function handleLogout() {
    await fetch("/api/admin/auth", { method: "DELETE" });
    setAuth(false);
    router.replace("/admin/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100 dark:bg-slate-900">
        <p className="text-slate-500">로딩 중...</p>
      </div>
    );
  }

  if (pathname === "/admin/login") return children;

  if (!auth) return null;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900">
      <header className="border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-lg font-semibold text-slate-800 dark:text-slate-100">
              관리자
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link
                href="/admin"
                className={`hover:text-blue-600 ${pathname === "/admin" ? "text-blue-600 font-medium" : "text-slate-600 dark:text-slate-400"}`}
              >
                글 목록
              </Link>
              <Link
                href="/admin/posts/new"
                className={`hover:text-blue-600 ${pathname === "/admin/posts/new" ? "text-blue-600 font-medium" : "text-slate-600 dark:text-slate-400"}`}
              >
                글 쓰기
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/" target="_blank" className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400">
              블로그 보기
            </Link>
            <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-red-600">
              로그아웃
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
