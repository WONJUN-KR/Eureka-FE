import Link from "next/link";

// 구역 제목: 왼쪽 명조 제목 + 설명, 오른쪽 '더 보기' 링크
export default function SectionHead({
  title,
  description,
  more,
  as: Tag = "h2",
}: {
  title: string;
  description?: string;
  more?: { href: string; label: string };
  as?: "h1" | "h2";
}) {
  return (
    <div className="mb-8 flex items-end justify-between gap-4">
      <div>
        <Tag className="font-serif text-[26px] leading-tight tracking-tight md:text-[32px]">
          {title}
        </Tag>
        {description && <p className="mt-2 text-[15px] text-ink-2">{description}</p>}
      </div>
      {more && (
        <Link href={more.href} className="shrink-0 text-[15px] text-ink-2 hover:text-foreground">
          {more.label} →
        </Link>
      )}
    </div>
  );
}
