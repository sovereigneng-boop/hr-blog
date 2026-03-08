import Link from "next/link";

export default function PostCard({ post }) {
  return (
    <article className="card-hover flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-sm hover:border-brand-400">
      <div className="mb-3 flex items-center justify-between text-xs text-slate-500">
        <span className="rounded-full bg-brand-500 text-white px-2 py-0.5 text-[11px] font-medium">
          {post.category}
        </span>
        <span>{post.date}</span>
      </div>
      <h2 className="mb-2 text-lg font-semibold tracking-tight text-slate-900">
        <Link href={`/posts/${post.slug}`} className="hover:text-brand-600">
          {post.title}
        </Link>
      </h2>
      <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-slate-600">
        {post.summary}
      </p>
      <div className="mt-auto flex items-center justify-between text-xs text-slate-500">
        <span>{post.readingTime} 읽기</span>
        <Link
          href={`/posts/${post.slug}`}
          className="inline-flex items-center rounded-full bg-brand-500 px-3 py-1 text-xs font-medium text-white hover:bg-brand-600"
        >
          자세히 보기 →
        </Link>
      </div>
    </article>
  );
}

