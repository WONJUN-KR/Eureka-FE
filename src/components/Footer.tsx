/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

// 원본 footer.jsp: 메뉴 줄 · 구분선 + 저작권 · 로고와 SNS 아이콘
const MENU = [
  { href: "/", label: "Home" },
  { href: "/posts", label: "발자취" },
  { href: "/posts/new", label: "글쓰기" },
  { href: "/mypage", label: "마이페이지" },
];
const SNS = [
  { href: "https://www.facebook.com/", src: "facebook.png", alt: "페이스북" },
  { href: "https://www.instagram.com/", src: "instagram.png", alt: "인스타그램" },
  { href: "https://twitter.com/", src: "twitter.png", alt: "트위터" },
];

export default function Footer() {
  return (
    <footer className="mt-20 bg-neutral-200">
      <div className="mx-auto max-w-6xl px-4">
        <ul className="flex flex-wrap justify-center gap-x-10 gap-y-2 pb-6 pt-12">
          {MENU.map((m) => (
            <li key={m.href}>
              <Link href={m.href} className="text-neutral-500 hover:text-neutral-800">
                {m.label}
              </Link>
            </li>
          ))}
        </ul>
        <hr className="mx-auto max-w-4xl border-neutral-800" />
        <p className="py-6 text-center text-sm text-neutral-500">&copy; FootPrint</p>
        <div className="flex items-center justify-between pb-8">
          <img src="/images/footerImages/logo.png" alt="FootPrint" className="w-28 md:w-36" />
          <div className="flex gap-4">
            {SNS.map((s) => (
              <a key={s.src} href={s.href} target="_blank" rel="noreferrer" aria-label={s.alt}>
                <img src={`/images/footerImages/${s.src}`} alt="" className="size-7" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
