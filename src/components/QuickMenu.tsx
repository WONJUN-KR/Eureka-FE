"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useState } from "react";

// 원본 sidebar.jsp 퀵메뉴 중 '맨 위로'만 남김 - 마이페이지 · 글쓰기는 헤더에 있음
// 한 화면 넘게 내렸을 때만 오른쪽 아래에 보임
export default function QuickMenu() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > window.innerHeight);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!show) return null;
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="맨 위로"
      className="fixed bottom-6 right-6 z-20 flex size-11 items-center justify-center rounded-full border bg-card text-ink-2 shadow-sm hover:text-foreground"
    >
      <ArrowUp className="size-[18px]" strokeWidth={1.5} />
    </button>
  );
}
