import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "../../../lib/posts";

export function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return {
      title: "글을 찾을 수 없습니다 - 직장인 권리 설명서"
    };
  }
  return {
    title: `${post.title} - 직장인 권리 설명서`,
    description: post.summary
  };
}

export default async function PostPage({ params }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="space-y-8">
      <div className="space-y-3 border-b border-slate-200 pb-6">
        <Link
          href="/"
          className="text-xs font-medium text-slate-500 hover:text-slate-700"
        >
          ← 목록으로 돌아가기
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full bg-brand-500 text-white px-2 py-0.5 text-xs font-medium">
              {post.category}
            </span>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {post.title}
            </h1>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>{post.date}</div>
            <div>{post.readingTime} 읽기</div>
          </div>
        </div>
      </div>

      <div
        className="prose prose-slate max-w-none text-sm sm:text-base"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  );
}

