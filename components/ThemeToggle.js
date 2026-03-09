"use client";

import { useEffect, useMemo, useState } from "react";

function getInitialTheme() {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  return prefersDark ? "dark" : "light";
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState("light");
  const isDark = useMemo(() => theme === "dark", [theme]);

  useEffect(() => {
    const initial = getInitialTheme();
    setTheme(initial);
    document.documentElement.classList.toggle("dark", initial === "dark");
  }, []);

  function toggleTheme() {
    const next = isDark ? "light" : "dark";
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
    window.localStorage.setItem("theme", next);
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/80 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm backdrop-blur hover:bg-white dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-200 dark:hover:bg-slate-950"
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
    >
      {isDark ? (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-slate-200"
        >
          <path
            d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12Z"
            stroke="currentColor"
            strokeWidth="2"
          />
          <path
            d="M12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.5 1.5M17.5 17.5 19 19M19 5l-1.5 1.5M6.5 17.5 5 19"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-slate-700 dark:text-slate-200"
        >
          <path
            d="M21 15.5A8.5 8.5 0 0 1 8.5 3a7 7 0 1 0 12.5 12.5Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      )}
      <span>{isDark ? "Light" : "Dark"}</span>
    </button>
  );
}

