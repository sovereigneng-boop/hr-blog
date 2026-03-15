/**
 * /posts 폴더의 .md 파일을 Vercel KV로 마이그레이션하는 스크립트
 *
 * 사용법:
 *   1. .env.local에 KV_REST_API_URL, KV_REST_API_TOKEN 설정
 *   2. node scripts/migrate-to-kv.mjs
 *
 * 이미 존재하는 slug는 덮어씁니다.
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import { createClient } from "@vercel/kv";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "..", ".env.local") });

const kv = createClient({
  url: process.env.KV_REST_API_URL,
  token: process.env.KV_REST_API_TOKEN,
});

const postsDir = path.join(__dirname, "..", "posts");
const INDEX_KEY = "posts:index";

async function main() {
  if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
    console.error("KV_REST_API_URL 또는 KV_REST_API_TOKEN이 .env.local에 없습니다.");
    process.exit(1);
  }

  const files = fs.readdirSync(postsDir).filter((f) => f.endsWith(".md"));
  console.log(`${files.length}개의 .md 파일을 발견했습니다.\n`);

  let success = 0;
  let failed = 0;

  for (const file of files) {
    const slug = file.replace(/\.md$/, "");
    try {
      const raw = fs.readFileSync(path.join(postsDir, file), "utf8");
      const { data, content } = matter(raw);

      const post = {
        slug,
        title: data.title || slug,
        date: data.date || new Date().toISOString().slice(0, 10),
        category: data.category || "",
        summary: data.summary || "",
        thumbnail: data.thumbnail || "",
        tags: data.tags || [],
        content: content.trim(),
      };

      const score = new Date(post.date).getTime();

      await Promise.all([
        kv.set(`post:${slug}`, post),
        kv.zadd(INDEX_KEY, { score, member: slug }),
      ]);

      console.log(`  ✓ ${slug}`);
      success++;
    } catch (e) {
      console.error(`  ✗ ${slug}: ${e.message}`);
      failed++;
    }
  }

  console.log(`\n완료: ${success}개 성공, ${failed}개 실패`);
}

main();
