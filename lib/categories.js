export const CATEGORIES = [
  { slug: "leave", label: "휴가(연차) 및 휴직", mainHeading: "휴가 및 휴직 3분 정복" },
  { slug: "pay", label: "급여(연봉) 및 수당", mainHeading: "급여(연봉) 및 수당 3분 정복" },
  { slug: "hr-labor", label: "인사 및 노무 상식", mainHeading: "인사 및 노무 상식 3분 정복" },
  { slug: "work-tips", label: "직장생활 꿀팁", mainHeading: "직장생활 꿀팁" }
];

export function getCategoryBySlug(slug) {
  return CATEGORIES.find((c) => c.slug === slug) ?? null;
}

