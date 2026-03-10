"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SearchBox({ variant = "default" }) {
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

  const isNav = variant === "nav";

  return (
    <form
      onSubmit={onSubmit}
      className={isNav ? "flex items-center gap-2" : "space-y-2"}
    >
      {!isNav && (
        <label
          htmlFor="site-search"
          className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
        >
          검색
        </label>
      )}
      <div className={isNav ? "flex items-center gap-2" : "flex items-center gap-2"}>
        <input
          id="site-search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder=""
          className={
            isNav
              ? "w-[160px] sm:w-[220px] md:w-[260px] rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-sm text-white shadow-sm outline-none placeholder:text-white/60 focus:border-white/30 focus:ring-2 focus:ring-[#2E6DB4]/30"
              : "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500"
          }
        />
        <button
          type="submit"
          className="flex items-center justify-center rounded-xl bg-[#2E6DB4] p-2 text-white shadow-sm hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-[#2E6DB4]/30"
          aria-label="검색"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.3-4.3" />
          </svg>
        </button>
      </div>
    </form>
  );
}

