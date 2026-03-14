"use client";

import { usePathname } from "next/navigation";

export default function HeaderTagline() {
  const pathname = usePathname();
  const isPostDetail = pathname?.startsWith("/posts/");

  if (isPostDetail) {
    return null;
  }

  return (
    <span className="hidden max-w-3xl whitespace-pre-line text-base text-white/80 sm:inline">
      {`바쁜 직장인들의 시간을 낭비하지 않겠습니다!
노동법, 연차 휴가, 복리후생, 연봉협상 등 직장인이라면 알아야 할 '권리'
모두 '3분'내로 핵심 내용만 설명하겠습니다!`}
    </span>
  );
}
