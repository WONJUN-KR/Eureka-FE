import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// 백엔드가 서빙하는 업로드 사진(/uploads/...)은 next/image 최적화(같은 서버 재요청) 대신 원본 그대로
// 정적 사진(/images/...)만 WebP 변환·리사이즈
export function isOptimizable(src: string) {
  return !src.startsWith("/uploads/");
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 백엔드 LocalDateTime(타임존 없는 문자열) → 2026.10.22 형태
export function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, "0")}.${String(d.getDate()).padStart(2, "0")}`;
}
