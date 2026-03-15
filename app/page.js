import Link from "next/link";
import PostCard from "../components/PostCard";
import { CATEGORIES } from "../lib/categories";
import { getAllPosts } from "../lib/posts-kv";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const posts = await getAllPosts();

  return (
    <div className="space-y-12">
      {CATEGORIES.map((category) => {
        const latest = posts
          .filter((p) => p.category === category.label)
          .slice(0, 3);

        return (
          <section key={category.slug} className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="space-y-1">
                <h2 className="font-heading text-[1.375rem] font-semibold tracking-tight text-[#1B2A4A] dark:text-slate-100">
                  {category.mainHeading ?? category.label}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  최신 글 {latest.length}개
                </p>
              </div>
              <Link
                href={`/category/${category.slug}`}
                className="text-sm font-medium text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200"
              >
                더보기 →
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {latest.map((post) => (
                <PostCard key={post.slug} post={post} variant="imageOnly" />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
