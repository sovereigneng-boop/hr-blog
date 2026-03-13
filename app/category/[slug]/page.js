import { notFound } from "next/navigation";
import PostCard from "../../../components/PostCard";
import { CATEGORIES, getCategoryBySlug } from "../../../lib/categories";
import { getAllPosts } from "../../../lib/posts";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }) {
  const category = getCategoryBySlug(params.slug);
  if (!category) {
    return { title: "카테고리를 찾을 수 없습니다 - 인사3분" };
  }
  return {
    title: `${category.label} - 인사3분`,
    description: `${category.label} 카테고리의 최신 글을 모아보세요.`
  };
}

export default function CategoryPage({ params }) {
  const category = getCategoryBySlug(params.slug);
  if (!category) notFound();

  const posts = getAllPosts().filter((p) => p.category === category.label);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
          {category.label}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          총 {posts.length}개의 글
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </section>
    </div>
  );
}

