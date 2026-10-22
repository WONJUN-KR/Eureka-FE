import Banner from "@/components/home/Banner";
import BannerAd from "@/components/home/BannerAd";
import BestPick from "@/components/home/BestPick";
import PageMerit from "@/components/home/PageMerit";
import RecommendTravel from "@/components/home/RecommendTravel";

// 원본 mainPage.jsp 순서 그대로: 배너 → 장점 → 이 달의 Best 픽 → 떠나기 좋은 도시 → 제휴 광고 (헤더·푸터·퀵메뉴는 레이아웃)
export default function Home() {
  return (
    <>
      <Banner />
      <PageMerit />
      <BestPick />
      <RecommendTravel />
      <BannerAd />
    </>
  );
}
