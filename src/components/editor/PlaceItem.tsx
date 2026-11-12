"use client";

import { ArrowDown, ArrowUp, ImagePlus, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo } from "react";

import type { ImageResponse } from "@/api/types";
import { inputClass } from "@/components/ui/field";
import { cn, isOptimizable } from "@/lib/utils";

import { MAX_PLACE_PHOTOS, type EditorPlace } from "./types";

export type SubCategoryGroup = { category: string; items: { id: number; name: string }[] };

const iconButton =
  "grid size-9 place-items-center rounded-lg text-ink-2 hover:bg-secondary hover:text-foreground disabled:opacity-30";

// 장소 한 칸: 번호 · 이름 · 주소 · 순서 버튼 · 종류 · 들른 시간 · 한 줄 메모 · 사진(최대 3장)
export default function PlaceItem({
  place,
  index,
  total,
  groups,
  onChange,
  onMove,
  onRemove,
  onRemoveImage,
}: {
  place: EditorPlace;
  index: number;
  total: number;
  groups: SubCategoryGroup[];
  onChange: (patch: Partial<EditorPlace>) => void;
  onMove: (to: number) => void;
  onRemove: () => void;
  onRemoveImage: (image: ImageResponse) => void;
}) {
  const photoCount = place.images.length + place.files.length;
  const previews = useMemo(() => place.files.map((f) => URL.createObjectURL(f)), [place.files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);
  const id = `place-${place.key}`;

  return (
    <li className="rounded-2xl border bg-card p-4 md:p-5">
      <div className="flex items-start gap-3">
        <span className="grid size-8 shrink-0 place-items-center rounded-full border-[1.5px] border-ink-2 text-sm font-medium tabular-nums">
          {index + 1}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[17px] font-medium leading-snug">{place.name}</p>
          {place.address && (
            <p className="truncate text-sm text-muted-foreground">{place.address}</p>
          )}
        </div>
        <div className="flex shrink-0">
          <button
            type="button"
            aria-label={`${place.name} 앞으로`}
            disabled={index === 0}
            onClick={() => onMove(index - 1)}
            className={iconButton}
          >
            <ArrowUp className="size-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label={`${place.name} 뒤로`}
            disabled={index === total - 1}
            onClick={() => onMove(index + 1)}
            className={iconButton}
          >
            <ArrowDown className="size-4" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label={`${place.name} 빼기`}
            onClick={onRemove}
            className={iconButton}
          >
            <Trash2 className="size-4" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_140px]">
        <select
          aria-label={`${place.name} 종류`}
          value={place.subCategoryId ?? ""}
          onChange={(e) =>
            onChange({ subCategoryId: e.target.value ? Number(e.target.value) : undefined })
          }
          className={cn(inputClass, "h-10 py-0 text-sm")}
        >
          <option value="">종류 (선택)</option>
          {groups.map((g) => (
            <optgroup key={g.category} label={g.category}>
              {g.items.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <input
          type="time"
          aria-label={`${place.name} 들른 시간 (선택)`}
          value={place.visitedAt}
          onChange={(e) => onChange({ visitedAt: e.target.value })}
          className={cn(inputClass, "h-10 py-0 text-sm tabular-nums")}
        />
      </div>
      <input
        aria-label={`${place.name} 한 줄 메모 (선택)`}
        placeholder="한 줄 메모 (선택) 예) 오전에 가면 덜 기다려요"
        maxLength={100}
        value={place.memo}
        onChange={(e) => onChange({ memo: e.target.value })}
        className={cn(inputClass, "mt-2 h-10 py-0 text-sm")}
      />

      <div className="mt-3 flex flex-wrap gap-2">
        {place.images.map((img) => (
          <Thumb
            key={img.id}
            src={img.url}
            label="올린 사진 지우기"
            onRemove={() => onRemoveImage(img)}
          />
        ))}
        {previews.map((url, i) => (
          <Thumb
            key={url}
            src={url}
            label="고른 사진 빼기"
            onRemove={() => onChange({ files: place.files.filter((_, j) => j !== i) })}
          />
        ))}
        {photoCount < MAX_PLACE_PHOTOS && (
          <label
            htmlFor={`${id}-photos`}
            className="grid size-20 cursor-pointer place-items-center rounded-lg border border-dashed text-muted-foreground hover:text-foreground"
          >
            <span className="flex flex-col items-center gap-1 text-xs">
              <ImagePlus className="size-5" strokeWidth={1.5} />
              사진 {photoCount}/{MAX_PLACE_PHOTOS}
            </span>
            <input
              id={`${id}-photos`}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={(e) => {
                const picked = Array.from(e.target.files ?? []).slice(
                  0,
                  MAX_PLACE_PHOTOS - photoCount
                );
                onChange({ files: [...place.files, ...picked] });
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
    </li>
  );
}

function Thumb({ src, label, onRemove }: { src: string; label: string; onRemove: () => void }) {
  return (
    <span className="relative size-20 overflow-hidden rounded-lg bg-secondary">
      <Image
        src={src}
        alt=""
        fill
        unoptimized={src.startsWith("blob:") || !isOptimizable(src)}
        sizes="80px"
        className="object-cover"
      />
      <button
        type="button"
        aria-label={label}
        onClick={onRemove}
        className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white"
      >
        <X className="size-3.5" strokeWidth={2} />
      </button>
    </span>
  );
}
