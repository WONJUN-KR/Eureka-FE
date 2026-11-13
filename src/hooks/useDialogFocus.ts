"use client";

import { type RefObject, useEffect, useRef } from "react";

// 창(모달) 포커스 관리: 열면 시작 요소로, Tab 은 창 안에서만 돌고(밖으로 샌 포커스도 되돌림), Esc 로 닫기, 닫으면 연 요소로
// 콜백은 ref 로 들고 있어서 부모가 다시 그려져도 포커스가 시작 요소로 튀지 않음
export function useDialogFocus(
  dialog: RefObject<HTMLElement | null>,
  opts: {
    onClose: () => void;
    // 처음 포커스할 요소
    initial: () => HTMLElement | null | undefined;
    // Tab 순환의 처음 · 끝
    edges: () => [HTMLElement | undefined, HTMLElement | undefined];
  }
) {
  const latest = useRef(opts);
  useEffect(() => {
    latest.current = opts;
  });

  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    latest.current.initial()?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return latest.current.onClose();
      if (e.key !== "Tab" || !dialog.current) return;
      const [first, last] = latest.current.edges();
      if (!dialog.current.contains(document.activeElement)) {
        e.preventDefault();
        first?.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus();
    };
  }, [dialog]);
}
