import Banner from "@/components/home/Banner";
import BannerAd from "@/components/home/BannerAd";
import BestPick from "@/components/home/BestPick";
import PageMerit from "@/components/home/PageMerit";
import RecommendTravel from "@/components/home/RecommendTravel";
import RegionFinder from "@/components/home/RegionFinder";

// 원본 mainPage.jsp 순서: 배너 → 장점 → Best 픽 → (지역으로 찾기) → 떠나기 좋은 도시 → 안내 배너
// 지역으로 찾기는 원본 헤더의 지역 메뉴를 지도로 한 번 더 보여주는 구역
export default function Home() {
  return (
    <>
      <Banner />
      <PageMerit />
      <BestPick />
      <RegionFinder />
      <RecommendTravel />
      <BannerAd />
    </>
  );
}
