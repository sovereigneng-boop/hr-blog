"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBox() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = useMemo(() => searchParams.get("q") ?? "", [searchParams]);
  const [value, setValue] = useState("");

  useEffect(() => {
    setValue(q);
  }, [q]);

  function onSubmit(e) {
    e.preventDefault();
    const next = value.trim();
    if (!next) {
      router.push("/search");
      return;
    }
    router.push(`/search?q=${encodeURIComponent(next)}`);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-2">
      <label
        htmlFor="site-search"
        className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
      >
        검색
      </label>
      <div className="flex items-center gap-2">
        <input
          id="site-search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="제목/요약/카테고리 검색"
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
        />
        <button
          type="submit"
          className="rounded-xl bg-brand-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500/30"
        >
          찾기
        </button>
      </div>
    </form>
  );
}

