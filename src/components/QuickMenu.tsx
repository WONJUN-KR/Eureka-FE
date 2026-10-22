"use client";

import { ChevronDown, ChevronUp, Home, PenLine } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { useAuthStore } from "@/stores/useAuthStore";

// 원본 sidebar.jsp 퀵메뉴: 오른쪽에 붙은 둥근 막대, 펼치면 마이페이지 · 글쓰기 · 맨 위로
export default function QuickMenu() {
  const [open, setOpen] = useState(false);
  const { isAuthenticated, isHydrated } = useAuthStore();
  const loggedIn = isHydrated && isAuthenticated;
  const item = "flex flex-col items-center gap-1 py-3 text-xs text-neutral-500 hover:text-black";

  return (
    <div className="fixed right-3 top-28 z-20 hidden w-20 rounded-3xl bg-neutral-200/60 text-center backdrop-blur md:block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="퀵메뉴"
        className="w-full py-3 text-neutral-500 hover:text-black"
      >
        <ChevronDown
          className={`mx-auto size-6 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <ul className="divide-y divide-neutral-300 border-t border-neutral-300">
          <li>
            <Link href={loggedIn ? "/mypage" : "/login"} className={item}>
              <Home className="size-4" aria-hidden />
              마이페이지
            </Link>
          </li>
          <li>
            <Link href={loggedIn ? "/posts/new" : "/login"} className={item}>
              <PenLine className="size-4" aria-hidden />
              글쓰기
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className={`${item} w-full`}
              aria-label="맨 위로"
            >
              <ChevronUp className="size-5" aria-hidden />
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
