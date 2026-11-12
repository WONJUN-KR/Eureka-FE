"use client";

import { MapPin, Search } from "lucide-react";
import { useState } from "react";

import { buttonClass, inputClass } from "@/components/ui/field";
import { hasKakaoKey, loadKakao, type KakaoPlace } from "@/lib/kakao";
import { cn } from "@/lib/utils";

import type { EditorPlace } from "./types";

// 장소 추가: 카카오 키워드 검색 결과에서 고름. 키가 없으면 이름 · 위경도를 직접 입력
export default function PlaceSearch({
  cityName,
  disabled,
  onAdd,
}: {
  cityName?: string;
  disabled?: boolean;
  onAdd: (place: Omit<EditorPlace, "key" | "images" | "files">) => void;
}) {
  if (!hasKakaoKey) return <ManualPlace disabled={disabled} onAdd={onAdd} />;
  return <KakaoSearch cityName={cityName} disabled={disabled} onAdd={onAdd} />;
}

function KakaoSearch({
  cityName,
  disabled,
  onAdd,
}: {
  cityName?: string;
  disabled?: boolean;
  onAdd: (place: Omit<EditorPlace, "key" | "images" | "files">) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<KakaoPlace[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  const search = async () => {
    const q = query.trim();
    if (!q) return;
    setSearching(true);
    setError(null);
    const kakao = await loadKakao();
    if (!kakao) {
      setSearching(false);
      setError("지도를 불러오지 못했어요. 잠시 뒤 다시 시도해 주세요.");
      return;
    }
    const { Places, Status } = kakao.maps.services;
    // 도시를 골랐으면 검색어 앞에 붙여서 그 도시 장소가 먼저 나오게
    const keyword = cityName && !q.includes(cityName) ? `${cityName} ${q}` : q;
    new Places().keywordSearch(
      keyword,
      (data, status) => {
        setSearching(false);
        if (status === Status.OK) setResults(data);
        else if (status === Status.ZERO_RESULT) setResults([]);
        else setError("검색에 실패했어요. 잠시 뒤 다시 시도해 주세요.");
      },
      { size: 8 }
    );
  };

  return (
    <div>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          search();
        }}
      >
        <label className="relative flex-1">
          <span className="sr-only">장소 검색</span>
          <Search
            className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={1.5}
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={cityName ? `${cityName}에서 들른 곳 이름` : "들른 곳 이름"}
            disabled={disabled}
            className={cn(inputClass, "pl-10")}
          />
        </label>
        <button type="submit" disabled={disabled || searching} className={buttonClass.ghost}>
          {searching ? "찾는 중" : "검색"}
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
      {results && (
        <ul className="mt-2 max-h-80 overflow-y-auto rounded-[10px] border bg-card">
          {results.length === 0 && (
            <li className="px-4 py-3 text-sm text-ink-2">검색 결과가 없어요</li>
          )}
          {results.map((r) => (
            <li key={r.id} className="border-t first:border-t-0">
              <button
                type="button"
                onClick={() => {
                  onAdd({
                    name: r.place_name,
                    address: r.road_address_name || r.address_name,
                    latitude: Number(r.y),
                    longitude: Number(r.x),
                    kakaoPlaceId: r.id,
                    groupName: r.category_group_name,
                    memo: "",
                    visitedAt: "",
                  });
                  setResults(null);
                  setQuery("");
                }}
                className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-secondary"
              >
                <MapPin
                  className="mt-0.5 size-4 shrink-0 text-muted-foreground"
                  strokeWidth={1.5}
                />
                <span className="min-w-0">
                  <span className="block text-[15px]">{r.place_name}</span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {r.category_group_name || r.category_name.split(" > ").pop()} ·{" "}
                    {r.road_address_name || r.address_name}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// 카카오 키가 없을 때 - 이름과 위경도를 직접 (지도 앱에서 복사한 좌표)
function ManualPlace({
  disabled,
  onAdd,
}: {
  disabled?: boolean;
  onAdd: (place: Omit<EditorPlace, "key" | "images" | "files">) => void;
}) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const latN = Number(lat);
  const lngN = Number(lng);
  const valid =
    name.trim() !== "" &&
    lat.trim() !== "" &&
    lng.trim() !== "" &&
    Math.abs(latN) <= 90 &&
    Math.abs(lngN) <= 180 &&
    !Number.isNaN(latN) &&
    !Number.isNaN(lngN);

  return (
    <div className="rounded-[10px] border border-dashed p-4">
      <p className="mb-3 text-sm text-ink-2">
        장소 검색을 쓸 수 없어서 이름과 위치(위도 · 경도)를 직접 넣어요
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        <input
          aria-label="장소 이름"
          placeholder="장소 이름"
          value={name}
          maxLength={100}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
        />
        <input
          aria-label="주소 (선택)"
          placeholder="주소 (선택)"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className={inputClass}
        />
        <input
          aria-label="위도"
          placeholder="위도 예) 35.0975"
          inputMode="decimal"
          value={lat}
          onChange={(e) => setLat(e.target.value)}
          className={inputClass}
        />
        <input
          aria-label="경도"
          placeholder="경도 예) 129.0106"
          inputMode="decimal"
          value={lng}
          onChange={(e) => setLng(e.target.value)}
          className={inputClass}
        />
      </div>
      <button
        type="button"
        disabled={disabled || !valid}
        onClick={() => {
          onAdd({
            name: name.trim(),
            address: address.trim() || undefined,
            latitude: latN,
            longitude: lngN,
            memo: "",
            visitedAt: "",
          });
          setName("");
          setAddress("");
          setLat("");
          setLng("");
        }}
        className={cn(buttonClass.ghost, "mt-3")}
      >
        장소 추가
      </button>
    </div>
  );
}
