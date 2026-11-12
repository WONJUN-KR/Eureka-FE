import koreaMap from "@/data/korea-map.json";
import { cn } from "@/lib/utils";

// 한국 지도 (SVG) - 지도 모양은 @svg-maps/south-korea (CC BY 4.0)
// 위경도 -> 지도 좌표는 시·도 중심 7곳으로 맞춘 1차식 (오차 5px 안팎, 실제 지도 대신 쓰는 개요용)
export type MapPoint = { latitude: number; longitude: number };

const [AX, BX, AY, BY] = koreaMap.fit;

export function project({ latitude, longitude }: MapPoint): [number, number] {
  return [AX * longitude + BX, AY * latitude + BY];
}

// BE 지역(region) 이름 -> 지도 시·도
export const REGION_PROVINCES: Record<string, string[]> = {
  수도권: ["seoul", "gyeonggi", "incheon"],
  강원도: ["gangwon"],
  "경상도/부산": ["busan", "daegu", "ulsan", "north-gyeongsang", "south-gyeongsang"],
  제주도: ["jeju"],
  "전라도/광주": ["gwangju", "north-jeolla", "south-jeolla"],
  "충청도/대전": ["daejeon", "sejong", "north-chungcheong", "south-chungcheong"],
};

export default function KoreaMap({
  highlight = [],
  className,
  title,
  children,
}: {
  // 색을 진하게 할 시·도 id
  highlight?: string[];
  className?: string;
  title: string;
  // 지도 좌표계(viewBox) 위에 그릴 점 · 선 - project() 로 좌표를 구해서 그림
  children?: React.ReactNode;
}) {
  const on = new Set(highlight);
  return (
    <svg
      viewBox={koreaMap.viewBox}
      role="img"
      aria-label={title}
      className={cn("h-auto w-full", className)}
    >
      <g>
        {koreaMap.provinces.map((p) => (
          <path
            key={p.id}
            d={p.path}
            className={cn(
              "stroke-card transition-colors duration-200",
              on.has(p.id) ? "fill-[#ddd3c0]" : "fill-[#e9e3d6]"
            )}
            strokeWidth={1.2}
          />
        ))}
      </g>
      {children}
    </svg>
  );
}

// 남한 지도에 찍어도 되는 좌표인지 - 위경도 상자에서 가까운 일본 땅(대마도 · 규슈 북부)과 북한 쪽을 뺌
// 국경을 정확히 따지진 않음. 지도에 그리는 점 거르기용
export function inSouthKorea({
  latitude: lat,
  longitude: lng,
}: {
  latitude: number;
  longitude: number;
}) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return false;
  if (lat < 33 || lat > 38.65 || lng < 124.5 || lng > 132) return false;
  // 울산 남쪽 바다 건너는 규슈 · 혼슈 끝 (부산 · 울산은 동경 129.4 안쪽)
  if (lat < 35.6 && lng > 129.6) return false;
  // 대마도
  if (lat > 34.05 && lat < 34.72 && lng > 129.15 && lng < 129.6) return false;
  return true;
}
