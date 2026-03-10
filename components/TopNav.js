"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATEGORIES } from "../lib/categories";

const NAV_ITEMS = [
  { href: "/", label: "전체글" },
  ...CATEGORIES.map((c) => ({ href: `/category/${c.slug}`, label: c.label }))
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <nav
      className="sticky top-[5.25rem] z-40 border-b border-white/10 bg-[#1A3A5C] shadow-sm"
      aria-label="카테고리"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <ul className="flex flex-wrap gap-0.5 py-2">
          {NAV_ITEMS.map(({ href, label }) => {
            const isActive =
              href === "/"
                ? pathname === "/"
                : pathname.startsWith(href);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={`block rounded-lg px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#2E6DB4] ${
                    isActive ? "bg-[#2E6DB4]" : ""
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
