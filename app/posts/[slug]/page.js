import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPostBySlug } from "../../../lib/posts-kv";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return {
      title: "글을 찾을 수 없습니다 - 인사3분"
    };
  }
  return {
    title: `${post.title} - 인사3분`,
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
      <div className="space-y-3 border-b border-slate-200 pb-6 dark:border-slate-800">
        <Link
          href="/"
          className="text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
        >
          ← 목록으로 돌아가기
        </Link>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-2">
            <span className="inline-flex items-center rounded-full bg-brand-500 text-white px-2 py-0.5 text-xs font-medium">
              {post.category}
            </span>
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
              {post.title}
            </h1>
          </div>
          <div className="text-right text-xs text-slate-500 dark:text-slate-400">
            <div>{post.date}</div>
          </div>
        </div>
      </div>

      {post.thumbnail ? (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 dark:border-slate-800 dark:bg-slate-900">
          <img
            src={post.thumbnail}
            alt=""
            className="h-64 w-full object-cover sm:h-72"
            loading="lazy"
          />
        </div>
      ) : null}

      <div
        className="prose prose-compact prose-slate max-w-none text-sm sm:text-base dark:prose-invert prose-a:text-brand-700 dark:prose-a:text-brand-300"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />
    </article>
  );
}
