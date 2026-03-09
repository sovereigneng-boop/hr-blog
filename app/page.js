import Link from "next/link";
import PostCard from "../components/PostCard";
import { CATEGORIES } from "../lib/categories";
import { getAllPosts } from "../lib/posts";

export default function HomePage() {
  const posts = getAllPosts();

  return (
    <div className="space-y-12">
      <section className="space-y-3">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50">
          직장인 권리 설명서
        </h1>
        <p className="max-w-2xl text-sm text-slate-600 sm:text-base dark:text-slate-300">
          근로기준법(노동법), 연차(휴가), 연봉협상, 근로조건 등 직장인이라면 꼭 알아야 할 권리를 현직 인사 담당자가 가장 쉽게 알려드립니다
        </p>
      </section>

      {CATEGORIES.map((category) => {
        const latest = posts
          .filter((p) => p.category === category.label)
          .slice(0, 3);

        return (
          <section key={category.slug} className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div className="space-y-1">
                <h2 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                  {category.label}
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

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {latest.map((post) => (
                <PostCard key={post.slug} post={post} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

