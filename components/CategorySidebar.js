import Link from "next/link";
import { CATEGORIES } from "../lib/categories";

export default function CategorySidebar() {
  return (
    <nav className="space-y-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        카테고리
      </div>
      <ul className="space-y-1">
        {CATEGORIES.map((c) => (
          <li key={c.slug}>
            <Link
              href={`/category/${c.slug}`}
              className="block rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-900/60 dark:hover:text-slate-50"
            >
              {c.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

