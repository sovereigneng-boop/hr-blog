import { kv } from "@vercel/kv";
import { remark } from "remark";
import html from "remark-html";

const POST_PREFIX = "post:";
const INDEX_KEY = "posts:index";

function postKey(slug) {
  return `${POST_PREFIX}${slug}`;
}

export async function getAllPosts() {
  const slugs = await kv.zrange(INDEX_KEY, 0, -1, { rev: true });
  if (!slugs || slugs.length === 0) return [];

  const pipeline = kv.pipeline();
  for (const slug of slugs) pipeline.get(postKey(slug));
  const results = await pipeline.exec();

  return results
    .filter(Boolean)
    .map((data) => ({
      slug: data.slug,
      title: data.title,
      date: data.date,
      category: data.category,
      summary: data.summary || "",
      thumbnail: data.thumbnail || "",
      tags: data.tags || [],
    }));
}

export async function getPostBySlug(slug) {
  const data = await kv.get(postKey(slug));
  if (!data) return null;

  const processedContent = await remark().use(html, { sanitize: false }).process(data.content || "");

  return {
    slug: data.slug,
    title: data.title,
    date: data.date,
    category: data.category,
    summary: data.summary || "",
    thumbnail: data.thumbnail || "",
    tags: data.tags || [],
    content: data.content || "",
    contentHtml: processedContent.toString(),
  };
}

export async function getPostRaw(slug) {
  return await kv.get(postKey(slug));
}

export async function savePost(slug, data) {
  const post = {
    slug,
    title: data.title,
    date: data.date,
    category: data.category,
    summary: data.summary ?? "",
    thumbnail: data.thumbnail ?? null,
    tags: data.tags || [],
    content: data.content || "",
  };

  const score = new Date(data.date).getTime();

  await Promise.all([
    kv.set(postKey(slug), post),
    kv.zadd(INDEX_KEY, { score, member: slug }),
  ]);

  return post;
}

export async function deletePost(slug) {
  await Promise.all([
    kv.del(postKey(slug)),
    kv.zrem(INDEX_KEY, slug),
  ]);
}
