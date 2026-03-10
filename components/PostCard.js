import Link from "next/link";

export default function PostCard({ post }) {
  const thumbnail =
    post.thumbnail ||
    "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1200&q=80";

  return (
    <article className="card-hover">
      <Link href={`/posts/${post.slug}`} className="group block">
        <div className="aspect-square overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
          <div className="grid h-full grid-rows-[2fr_1fr]">
            <div className="relative overflow-hidden bg-slate-100 dark:bg-slate-900">
              <img
                src={thumbnail}
                alt=""
                className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
                loading="lazy"
              />
            </div>

            <div className="flex items-center p-4">
              <h2 className="line-clamp-2 text-sm font-semibold leading-snug text-slate-900 group-hover:text-brand-700 dark:text-slate-50 dark:group-hover:text-brand-300">
                {post.title}
              </h2>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

