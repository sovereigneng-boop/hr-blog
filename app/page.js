import PostCard from "../components/PostCard";
import { posts } from "../lib/posts";

export default function HomePage() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          직장인 권리 설명서
        </h1>
        <p className="max-w-2xl text-sm text-slate-700 sm:text-base">
          근로기준법(노동법), 연차(휴가), 연봉협상, 근로조건 등 직장인이라면 꼭 알아야 할 권리를 현직 인사 담당자가 가장 쉽게 알려드립니다
        </p>
      </section>

      <section className="grid gap-5 sm:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </section>
    </div>
  );
}

