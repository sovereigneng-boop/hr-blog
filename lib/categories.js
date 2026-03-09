export const CATEGORIES = [
  { slug: "leave", label: "휴가(연차) 및 휴직" },
  { slug: "pay", label: "급여(연봉) 및 수당" },
  { slug: "hr-labor", label: "인사 및 노무 상식" },
  { slug: "work-tips", label: "직장생활 꿀팁" }
];

export function getCategoryBySlug(slug) {
  return CATEGORIES.find((c) => c.slug === slug) ?? null;
}

