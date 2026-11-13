"use client";

import { useEffect, useRef, useState } from "react";

import { loadKakao, type Kakao, type LatLng } from "@/lib/kakao";
import { cn } from "@/lib/utils";

// 한 여행의 경로: 들른 순서대로 번호 핀 + 주황 점선
// 카카오 키가 있으면 카카오맵 위에, 없으면 좌표만으로 그린 약도(SketchRoute)
export type RouteStop = LatLng & { name: string };

const TRAIL = "#c9532a";
// 부모가 크기를 안 주면 쓰는 기본 크기(4:3) - 높이 0 인 컨테이너엔 카카오맵이 안 그려짐
const BOX = "aspect-[4/3] w-full";

export default function RouteMap({
  stops,
  active,
  onSelect,
  className,
}: {
  stops: RouteStop[];
  // 강조할 장소 순번(0부터)
  active?: number;
  onSelect?: (index: number) => void;
  className?: string;
}) {
  const [kakao, setKakao] = useState<Kakao | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    loadKakao().then((k) => alive && setKakao(k));
    return () => {
      alive = false;
    };
  }, []);

  if (stops.length === 0) return null;
  if (kakao === undefined)
    return <div className={cn(BOX, "animate-pulse bg-secondary", className)} />;
  if (kakao === null)
    return <SketchRoute stops={stops} active={active} onSelect={onSelect} className={className} />;
  return (
    <KakaoRoute
      kakao={kakao}
      stops={stops}
      active={active}
      onSelect={onSelect}
      className={className}
    />
  );
}

function KakaoRoute({
  kakao,
  stops,
  active,
  onSelect,
  className,
}: {
  kakao: Kakao;
  stops: RouteStop[];
  active?: number;
  onSelect?: (index: number) => void;
  className?: string;
}) {
  const el = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pins = useRef<any[]>([]);
  // 핀은 장소가 바뀔 때만 다시 만들고, 클릭은 늘 최신 onSelect 를 부름
  const selectRef = useRef(onSelect);
  useEffect(() => {
    selectRef.current = onSelect;
  });

  // 지도 · 경로 · 핀은 장소가 바뀔 때만 다시 그림
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const { maps } = kakao;
    const path = stops.map((s) => new maps.LatLng(s.latitude, s.longitude));
    const map = new maps.Map(node, { center: path[0], level: 5 });
    mapRef.current = map;
    const bounds = new maps.LatLngBounds();
    path.forEach((p) => bounds.extend(p));
    if (path.length > 1) map.setBounds(bounds, 48, 48, 48, 48);

    const line = new maps.Polyline({
      map,
      path,
      strokeWeight: 3,
      strokeColor: TRAIL,
      strokeOpacity: 0.9,
      strokeStyle: "shortdash",
    });
    pins.current = stops.map((s, i) => {
      const pin = document.createElement("button");
      pin.type = "button";
      pin.textContent = String(i + 1);
      pin.setAttribute("aria-label", `${i + 1}. ${s.name}`);
      pin.className = "eureka-pin";
      pin.onclick = () => selectRef.current?.(i);
      return new maps.CustomOverlay({
        map,
        position: path[i],
        content: pin,
        yAnchor: 0.5,
        xAnchor: 0.5,
      });
    });
    return () => {
      pins.current.forEach((p) => p.setMap(null));
      line.setMap(null);
      mapRef.current = null;
      node.replaceChildren();
    };
  }, [kakao, stops]);

  // 고른 장소는 핀을 주황으로 바꾸고 지도 가운데로
  useEffect(() => {
    pins.current.forEach((p, i) => p.getContent().classList.toggle("is-active", i === active));
    // 장소 수가 줄었는데 예전 번호가 남아 있으면 건너뜀
    const s = active != null ? stops[active] : undefined;
    if (s && mapRef.current) {
      mapRef.current.panTo(new kakao.maps.LatLng(s.latitude, s.longitude));
    }
  }, [active, kakao, stops]);

  return <div ref={el} className={cn(BOX, "overflow-hidden", className)} />;
}

// 키가 없을 때: 위경도를 화면 좌표로 바로 옮긴 약도 (경도는 위도에 맞춰 줄임)
function SketchRoute({
  stops,
  active,
  onSelect,
  className,
}: {
  stops: RouteStop[];
  active?: number;
  onSelect?: (index: number) => void;
  className?: string;
}) {
  const W = 400;
  const H = 300;
  const PAD = 36;
  const lats = stops.map((s) => s.latitude);
  const lngs = stops.map((s) => s.longitude);
  const k = Math.cos(((Math.min(...lats) + Math.max(...lats)) / 2) * (Math.PI / 180));
  const spanX = Math.max((Math.max(...lngs) - Math.min(...lngs)) * k, 1e-4);
  const spanY = Math.max(Math.max(...lats) - Math.min(...lats), 1e-4);
  const scale = Math.min((W - PAD * 2) / spanX, (H - PAD * 2) / spanY);
  const cx = (Math.max(...lngs) + Math.min(...lngs)) / 2;
  const cy = (Math.max(...lats) + Math.min(...lats)) / 2;
  const pts = stops.map((s) => [
    W / 2 + (s.longitude - cx) * k * scale,
    H / 2 - (s.latitude - cy) * scale,
  ]);

  return (
    <div className={cn(BOX, "bg-[#efe9dc]", className)}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="size-full"
        // 핀을 고를 수 있으면 버튼 묶음(group), 보기만 하면 그림(img)
        role={onSelect ? "group" : "img"}
        aria-label="들른 장소 약도"
      >
        <defs>
          <pattern id="sketch-grid" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M24 0H0V24" fill="none" stroke="#1f2722" strokeOpacity="0.06" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#sketch-grid)" />
        <polyline
          points={pts.map((p) => p.join(",")).join(" ")}
          fill="none"
          stroke={TRAIL}
          strokeWidth={2.5}
          strokeDasharray="2 6"
          strokeLinecap="round"
        />
        {pts.map(([x, y], i) => (
          <g
            key={i}
            onClick={() => onSelect?.(i)}
            // 키보드로도 고를 수 있게 (카카오맵 쪽 핀은 button)
            {...(onSelect && {
              role: "button",
              tabIndex: 0,
              "aria-label": `${i + 1}. ${stops[i].name}`,
              onKeyDown: (e: React.KeyboardEvent) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(i);
                }
              },
            })}
            className={
              onSelect ? "cursor-pointer outline-none focus-visible:opacity-80" : undefined
            }
          >
            <circle
              cx={x}
              cy={y}
              r={11}
              fill={i === active ? TRAIL : "#fffdf8"}
              stroke={i === active ? TRAIL : "#4b564f"}
              strokeWidth={1.5}
            />
            <text
              x={x}
              y={y + 4}
              textAnchor="middle"
              fontSize="11"
              fontWeight="500"
              fill={i === active ? "#fffdf8" : "#1f2722"}
            >
              {i + 1}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
