import Link from "next/link";
import { notFound } from "next/navigation";
import { posts, getPostBySlug } from "../../../lib/posts";

export function generateStaticParams() {
  return posts.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug);
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

export default function PostPage({ params }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const paragraphs = post.content
    .trim()
    .split("\n\n")
    .map((block) => block.trim())
    .filter(Boolean);

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

      <div className="prose prose-slate max-w-none text-sm sm:text-base">
        {paragraphs.map((block, index) => {
          if (block.startsWith("## ")) {
            return (
              <h2 key={index} className="mt-8 text-xl font-semibold">
                {block.replace("## ", "")}
              </h2>
            );
          }

          if (block.startsWith("- ")) {
            const items = block
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean);
            return (
              <ul key={index} className="list-disc pl-5">
                {items.map((item, i) => (
                  <li key={i}>{item.replace(/^-\s*/, "")}</li>
                ))}
              </ul>
            );
          }

          if (block.match(/^\d+\./)) {
            const items = block
              .split("\n")
              .map((line) => line.trim())
              .filter(Boolean);
            return (
              <ol key={index} className="list-decimal pl-5">
                {items.map((item, i) => (
                  <li key={i}>{item.replace(/^\d+\.\s*/, "")}</li>
                ))}
              </ol>
            );
          }

          return <p key={index}>{block}</p>;
        })}
      </div>
    </article>
  );
}

