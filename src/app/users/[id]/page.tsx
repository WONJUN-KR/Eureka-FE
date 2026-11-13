"use client";

import { useParams } from "next/navigation";

import UserJourney from "@/components/UserJourney";

// 공개 유레카 페이지 - 로그인 없이 볼 수 있고 주소 그대로 공유
export default function UserPage() {
  const { id } = useParams<{ id: string }>();
  // 숫자가 아닌 주소(/users/abc)는 바로 없는 사람으로
  if (!/^\d+$/.test(id))
    return <p className="px-4 pt-32 text-center text-ink-2">없는 사용자예요</p>;
  return (
    <div className="mx-auto max-w-6xl px-4 pb-8 pt-28 md:px-8 md:pt-32">
      <UserJourney userId={Number(id)} />
    </div>
  );
}
