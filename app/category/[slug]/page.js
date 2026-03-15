import { notFound } from "next/navigation";
import PostCard from "../../../components/PostCard";
import { CATEGORIES, getCategoryBySlug } from "../../../lib/categories";
import { getAllPosts } from "../../../lib/posts-kv";

export const dynamic = "force-dynamic";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export function generateMetadata({ params }) {
  const category = getCategoryBySlug(params.slug);
  if (!category) {
    return { title: "카테고리를 찾을 수 없습니다 - 인사3분" };
  }
  return {
    title: `${category.mainHeading ?? category.label} - 인사3분`,
    description: `${category.mainHeading ?? category.label} 카테고리의 최신 글을 모아보세요.`
  };
}

export default async function CategoryPage({ params }) {
  const category = getCategoryBySlug(params.slug);
  if (!category) notFound();

  const allPosts = await getAllPosts();
  const posts = allPosts.filter((p) => p.category === category.label);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="font-heading text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
          {category.mainHeading ?? category.label}
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          총 {posts.length}개의 글
        </p>
      </div>

      <section className="grid grid-cols-3 gap-2 sm:gap-4">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} variant="imageOnly" />
        ))}
      </section>
    </div>
  );
}
