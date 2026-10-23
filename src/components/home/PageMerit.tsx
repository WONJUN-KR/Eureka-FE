import Image from "next/image";

// 원본 pageMerit.jsp: 서비스 장점 3개 (문구 그대로)
const MERITS = [
  {
    img: "guide_merit.png",
    title: "오늘은 내가 투어가이드!",
    text: ["혼자 즐기기 아쉬운 스팟을 공유해주세요!", "당신의 센스에 모두 감탄할거에요!"],
  },
  {
    img: "place_merit.png",
    title: "처음 방문하는 곳도 나의 홈 그라운드!",
    text: [
      "새로운 지역에 방문하신다면 가이드들의 픽을",
      "지도 삼아 즐겨보세요! 복잡한 여행 계획은 NO!",
    ],
  },
  {
    img: "sale_merit.png",
    title: "유레카에서 할인받자!",
    text: [
      "유레카는 주기적으로 제휴를 맺어",
      "프로모션을 진행중이에요.",
      "여행을 계획할 땐 유레카를 통해!",
    ],
  },
];

export default function PageMerit() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <ul className="grid gap-12 text-center md:grid-cols-3">
        {MERITS.map((m) => (
          <li key={m.img} className="flex flex-col items-center">
            <Image
              src={`/images/contentsImages/${m.img}`}
              alt=""
              width={192}
              height={192}
              className="mb-8 w-40 opacity-90 md:w-48"
            />
            <h2 className="mb-6 text-xl font-bold">{m.title}</h2>
            <p className="text-[17px] font-medium leading-7 text-neutral-500">
              {m.text.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
