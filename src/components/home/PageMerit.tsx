// 서비스로 할 수 있는 일 3가지 - 상자 · 아이콘 없이 글만
// 원본의 '제휴 할인' 문구는 실제 제휴가 없어서 뺌
const MERITS = [
  {
    step: "남기기",
    title: "들른 곳을 순서대로 남겨요",
    text: "어디서 놀고 먹고 쉬었는지, 사진과 한 줄 메모로",
  },
  {
    step: "따라가기",
    title: "다른 사람의 여행을 따라가요",
    text: "지역과 테마로 찾고, 지도 위 경로 그대로 다녀오기",
  },
  {
    step: "먹기",
    title: "맛집가자, 이번 주말 어디 갈까?",
    text: "한식부터 카페까지 여행지 맛집 모음",
  },
];

export default function PageMerit() {
  return (
    <section className="mx-auto max-w-6xl px-4 md:px-8">
      <ul className="grid gap-8 border-b py-14 md:grid-cols-3 md:gap-12">
        {MERITS.map((m) => (
          <li key={m.step}>
            <p className="mb-3 text-[13px] font-medium text-muted-foreground">{m.step}</p>
            <h2 className="mb-1.5 text-[17px] font-medium">{m.title}</h2>
            <p className="text-[15px] text-ink-2">{m.text}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
