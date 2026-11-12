import Image from "next/image";
import Link from "next/link";

// 첫 화면: 사진 한 장 위 왼쪽 빈 하늘 자리에 짧은 제목과 버튼 두 개 (원본 문구 '여행의 발견, 유레카')
// 원본은 3장 슬라이드였는데, 글자가 늘 같은 자리에 읽히도록 한 장으로 둠
export default function Banner() {
  return (
    <section className="relative h-[86vh] max-h-[720px] min-h-[520px] overflow-hidden">
      <Image
        src="/images/bannerImages/banner2.jpg"
        alt=""
        fill
        priority
        quality={70}
        sizes="100vw"
        className="object-cover object-[70%_40%]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[rgba(20,26,22,0.62)] via-[rgba(20,26,22,0.25)] to-transparent" />
      <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center px-4 text-[#fbf8f1] md:px-8">
        <p className="mb-4 text-[15px] opacity-85">여행의 발견, 유레카</p>
        <h1 className="mb-5 max-w-[620px] font-serif text-[34px] leading-[1.25] tracking-tight md:text-[52px]">
          다녀온 곳을 남기고
          <br />
          다른 사람의 여행을 따라가요
        </h1>
        <p className="mb-8 max-w-md text-[17px] opacity-90 md:text-lg">
          들른 곳을 순서대로 이으면 지도 위에 나만의 경로가 생겨요
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/posts"
            className="inline-flex h-11 items-center rounded-[10px] bg-card px-5 text-[15px] font-medium text-foreground hover:bg-card/90"
          >
            여행 기록 둘러보기
          </Link>
          <Link
            href="/posts/new"
            className="inline-flex h-11 items-center rounded-[10px] border border-white/40 px-5 text-[15px] font-medium text-[#fbf8f1] hover:bg-white/10"
          >
            나만의 장소 공유하기
          </Link>
        </div>
      </div>
    </section>
  );
}
