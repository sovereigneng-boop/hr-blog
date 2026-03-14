"use client";

import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import HeaderTagline from "./HeaderTagline";

export default function SiteHeader() {
  const pathname = usePathname();
  const isPostDetail = pathname?.startsWith("/posts/");
  const isHome = pathname === "/";

  return (
    <header
      className={`z-50 border-b border-white/10 bg-[#0A2540] shadow-sm ${
        isHome || isPostDetail ? "relative" : "sticky top-0"
      }`}
    >
      <div
        className={`mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8 ${
          isPostDetail ? "py-2" : "py-4"
        }`}
      >
        <div className="flex flex-col gap-1">
          <span
            className={`tracking-tight text-white ${
              isPostDetail ? "site-title-compact" : "site-title"
            }`}
          >
            인사3분
          </span>
          <HeaderTagline />
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
