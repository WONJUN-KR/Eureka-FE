import Link from "next/link";

// 원본 footer.jsp: 메뉴 줄 · 저작권 · 로고 - 원본의 SNS 아이콘은 실제 계정이 없어서 뺌
const MENU = [
  { href: "/posts?categoryId=1", label: "여행가자" },
  { href: "/posts?categoryId=2", label: "맛집가자" },
  { href: "/posts?categoryId=3", label: "놀러가자" },
  { href: "/posts/new", label: "글쓰기" },
];

export default function Footer() {
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
            {MENU.map((m) => (
              <li key={m.href}>
                <Link href={m.href} className="hover:text-foreground">
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
