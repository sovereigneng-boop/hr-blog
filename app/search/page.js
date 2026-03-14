import PostCard from "../../components/PostCard";
import { getAllPosts } from "../../lib/posts";

function normalize(str) {
  return (str ?? "").toString().trim().toLowerCase();
}

export function generateMetadata({ searchParams }) {
  const q = (searchParams?.q ?? "").toString().trim();
  if (!q) {
    return {
      title: "검색 - 인사3분",
      description: "블로그 글을 검색해보세요."
    };
  }
  return {
    title: `"${q}" 검색 결과 - 인사3분`,
    description: `"${q}"에 대한 검색 결과입니다.`
  };
}

export default function SearchPage({ searchParams }) {
  const qRaw = (searchParams?.q ?? "").toString();
  const q = normalize(qRaw);
  const posts = getAllPosts();

  const results = q
    ? posts.filter((p) => {
        const haystack = normalize(
          `${p.title ?? ""} ${p.summary ?? ""} ${p.category ?? ""}`
        );
        return haystack.includes(q);
      })
    : [];

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl dark:text-slate-50">
          검색
        </h1>
        {q ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            “{qRaw}” 검색 결과 {results.length}개
          </p>
        ) : (
          <p className="text-sm text-slate-600 dark:text-slate-300">
            오른쪽 검색창에서 키워드를 입력해 주세요.
          </p>
        )}
      </div>

      {q ? (
        <section className="grid grid-cols-3 gap-2 sm:gap-4">
          {results.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </section>
      ) : null}
    </div>
  );
}

