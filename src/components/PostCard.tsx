/* eslint-disable @next/next/no-img-element */
import { Heart } from "lucide-react";
import Link from "next/link";

import type { PostResponse } from "@/api/types";

// 원본 boardList.jsp 한 칸: 사진 350x200 · 굵은 제목(가운데) · 회색 작은 글씨로 도시·테마
// 대표 사진이 없으면 원본 추천 도시 사진을 글 번호로 돌려 씀
const FALLBACK = [
  "seoul",
  "busan",
  "jeju",
  "gangneung",
  "yeosu",
  "sokcho",
  "songdo",
  "gapyeong",
  "damyang",
  "pohang",
];

export default function PostCard({ post }: { post: PostResponse }) {
  const img =
    post.thumbnailUrl || `/images/recommendImages/${FALLBACK[post.id % FALLBACK.length]}.jpg`;
  return (
    <Link href={`/posts/${post.id}`} className="group block">
      <div className="overflow-hidden rounded">
        <img
          src={img}
          alt=""
          className="aspect-[7/4] w-full object-cover transition-transform duration-300 group-hover:scale-105 motion-reduce:transition-none"
        />
      </div>
      <strong className="block px-1 pb-1 pt-2 text-center text-lg font-bold text-neutral-800">
        {post.title}
      </strong>
      <p className="flex items-center justify-center gap-2 text-sm text-neutral-500">
        <span>
          {post.cityName} · {post.subCategoryName}
        </span>
        <span className="inline-flex items-center gap-0.5">
          <Heart className="size-3.5" aria-hidden />
          {post.likeCount}
        </span>
      </p>
    </Link>
  );
}
