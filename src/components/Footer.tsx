"use client";

import Link from "next/link";

import { useCategories } from "@/api/queries";

// 원본 footer.jsp: 메뉴 줄 · 저작권 · 로고 - 원본의 SNS 아이콘은 실제 계정이 없어서 뺌
// 카테고리 링크는 헤더처럼 API 에서 받아서 id · 이름을 맞춤
export default function Footer() {
  const { data: categories } = useCategories();
  return (
    <footer className="mt-24 border-t">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm text-muted-foreground md:flex-row md:items-start md:justify-between md:px-8">
        <div>
          <p className="mb-2 font-serif text-lg text-foreground">유레카</p>
          <p>여행의 발견, 유레카</p>
          <p className="mt-1">&copy; 유레카</p>
        </div>
        <nav aria-label="푸터 메뉴">
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            {categories?.map((c) => (
              <li key={c.id}>
                <Link href={`/posts?categoryId=${c.id}`} className="hover:text-foreground">
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/posts/new" className="hover:text-foreground">
                글쓰기
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </footer>
  );
}
