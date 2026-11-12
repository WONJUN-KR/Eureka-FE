"use client";

import { useQueries, useQueryClient } from "@tanstack/react-query";
import { ImagePlus, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { ENDPOINTS } from "@/api/endpoints";
import { deleteImage, uploadImage, useCreatePost, useUpdatePost } from "@/api/mutations";
import { useCategories, useCities, useRegions, useSubCategories } from "@/api/queries";
import { queryKeys } from "@/api/queryKeys";
import { get, getErrorMessage } from "@/api/request";
import type {
  ImageResponse,
  PlaceRequest,
  PostDetailResponse,
  SubCategoryResponse,
} from "@/api/types";
import RouteMap from "@/components/map/RouteMap";
import { buttonClass, ErrorText, Field, inputClass } from "@/components/ui/field";
import { cn, isOptimizable } from "@/lib/utils";

import PlaceItem, { type SubCategoryGroup } from "./PlaceItem";
import PlaceSearch from "./PlaceSearch";
import { MAX_PLACES, type EditorPlace } from "./types";

// 글쓰기 · 수정 공통 편집기 (원본 sidebar.jsp 글쓰기 창의 2단계 흐름)
// 1단계: 어디서 무엇을 (카테고리 · 세부 테마 · 지역 · 도시)
// 2단계: 들른 곳(순서 · 종류 · 시간 · 메모 · 사진)과 제목 · 요약 · 본문 · 글 전체 사진
const MAX_POST_PHOTOS = 30;
let tempKey = 0;
const newKey = () => `new-${++tempKey}`;

// 장소 사진이 상세 응답에 안 실려 오면 글 사진 목록에서 placeId 로 찾아 채움
const toEditorPlaces = (post?: PostDetailResponse, images: ImageResponse[] = []): EditorPlace[] =>
  (post?.places ?? []).map((p) => ({
    key: `id-${p.id}`,
    id: p.id,
    name: p.name,
    address: p.address ?? undefined,
    latitude: p.latitude,
    longitude: p.longitude,
    kakaoPlaceId: p.kakaoPlaceId ?? undefined,
    subCategoryId: p.subCategoryId ?? undefined,
    memo: p.memo ?? "",
    visitedAt: p.visitedAt ?? "",
    images: p.images ?? images.filter((x) => x.placeId === p.id),
    files: [],
  }));

const toRequest = (p: EditorPlace): PlaceRequest => ({
  id: p.id,
  name: p.name,
  address: p.address,
  latitude: p.latitude,
  longitude: p.longitude,
  kakaoPlaceId: p.kakaoPlaceId,
  subCategoryId: p.subCategoryId,
  memo: p.memo.trim() || undefined,
  visitedAt: p.visitedAt || undefined,
});

export default function PostEditor({
  initial,
  initialImages = [],
}: {
  // 수정이면 기존 글과 사진
  initial?: PostDetailResponse;
  initialImages?: ImageResponse[];
}) {
  const router = useRouter();
  const qc = useQueryClient();
  const editing = initial != null;
  const [step, setStep] = useState<1 | 2>(editing ? 2 : 1);

  // 1단계
  const [categoryId, setCategoryId] = useState(initial?.category.categoryId);
  const [subCategoryId, setSubCategoryId] = useState(initial?.category.subCategoryId);
  const [regionId, setRegionId] = useState(initial?.location.regionId);
  const [cityId, setCityId] = useState(initial?.location.cityId);
  // 2단계
  const [title, setTitle] = useState(initial?.title ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [places, setPlaces] = useState<EditorPlace[]>(() => toEditorPlaces(initial, initialImages));
  const [postImages, setPostImages] = useState(initialImages.filter((i) => i.placeId == null));
  const [postFiles, setPostFiles] = useState<File[]>([]);
  const [removedImageIds, setRemovedImageIds] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const { data: categories } = useCategories();
  const { data: subCategories } = useSubCategories(categoryId);
  const { data: regions } = useRegions();
  const { data: cities } = useCities(regionId);
  const create = useCreatePost();
  const update = useUpdatePost(initial?.id ?? -1);

  // 장소 종류는 세 카테고리의 세부 테마를 모두 고를 수 있게
  const subLists = useQueries({
    queries: (categories ?? []).map((c) => ({
      queryKey: queryKeys.categories.sub(c.id),
      queryFn: () => get<SubCategoryResponse[]>(ENDPOINTS.CATEGORIES.SUB(c.id)),
      staleTime: Infinity,
    })),
  });
  const groups: SubCategoryGroup[] = (categories ?? []).map((c, i) => ({
    category: c.name,
    items: subLists[i]?.data ?? [],
  }));
  const allSubs = groups.flatMap((g) => g.items);
  // 수정 중 원래 도시 그대로일 때만 원래 이름으로 대신함 (다른 도시를 고르면 목록이 올 때까지 비움)
  const cityName =
    cities?.find((c) => c.id === cityId)?.name ??
    (cityId === initial?.location.cityId ? initial?.location.cityName : undefined);

  const photoTotal =
    places.reduce((n, p) => n + p.images.length + p.files.length, 0) +
    postImages.length +
    postFiles.length;
  const step1Done = categoryId && subCategoryId && regionId && cityId;

  const patchPlace = (key: string, patch: Partial<EditorPlace>) =>
    setPlaces((ps) => ps.map((p) => (p.key === key ? { ...p, ...patch } : p)));
  const movePlace = (from: number, to: number) =>
    setPlaces((ps) => {
      const next = [...ps];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  const removeImage = (img: ImageResponse) => {
    setRemovedImageIds((ids) => [...ids, img.id]);
    setPlaces((ps) => ps.map((p) => ({ ...p, images: p.images.filter((x) => x.id !== img.id) })));
    setPostImages((xs) => xs.filter((x) => x.id !== img.id));
  };

  const validate = () => {
    if (!step1Done) return "어디서 무엇을 했는지 먼저 골라 주세요";
    if (places.length === 0) return "들른 곳을 1곳 이상 넣어 주세요";
    if (!title.trim()) return "제목을 써 주세요";
    if (!content.trim()) return "본문을 써 주세요";
    if (photoTotal > MAX_POST_PHOTOS)
      return `사진은 글 하나에 ${MAX_POST_PHOTOS}장까지 올릴 수 있어요`;
    return null;
  };

  const submit = async () => {
    const invalid = validate();
    setError(invalid);
    if (invalid) return;
    setSaving(true);
    const body = {
      cityId: cityId!,
      subCategoryId: subCategoryId!,
      title: title.trim(),
      content,
      // 수정은 빈 값을 보내야 기존 요약이 지워짐 (안 보내면 그대로 둠)
      summary: editing ? summary.trim() : summary.trim() || undefined,
      places: places.map(toRequest),
    };
    let saved: PostDetailResponse;
    try {
      saved = editing ? await update.mutateAsync(body) : await create.mutateAsync(body);
    } catch (e) {
      setSaving(false);
      setError(getErrorMessage(e));
      return;
    }
    // 글이 저장된 뒤 사진 정리 - 지운 사진 먼저(장수 제한 안 넘게), 그다음 장소별 · 글 전체 사진 업로드
    // 사진이 실패해도 글은 남기고 상세로 이동, 실패 수만 알림
    // 지우기는 한꺼번에, 올리기는 순서가 사진 순서라 하나씩 - 글 전체 사진을 먼저(첫 장이 목록 썸네일)
    const deleted = await Promise.allSettled(removedImageIds.map((id) => deleteImage(id)));
    const notDeleted = deleted.filter((r) => r.status === "rejected").length;
    let failed = 0;
    for (const f of postFiles) await uploadImage(saved.id, f).catch(() => failed++);
    // 저장된 장소를 보낸 순서로 맞춰서 사진을 붙임 - 개수가 다르면 엉뚱한 장소에 붙지 않게 장소 사진은 건너뜀
    // 저장 응답에 장소가 안 실려 오면 상세를 다시 받아서 장소 id 를 확인
    const placeList =
      saved.places ??
      (await get<PostDetailResponse>(ENDPOINTS.POSTS.DETAIL(saved.id))
        .then((d) => d.places)
        .catch(() => undefined)) ??
      [];
    const savedPlaces = [...placeList].sort((a, b) => a.seq - b.seq);
    const placesMatch = savedPlaces.length === places.length;
    for (const [i, p] of places.entries()) {
      for (const f of p.files) {
        if (!placesMatch) {
          failed++;
          continue;
        }
        await uploadImage(saved.id, f, savedPlaces[i].id).catch(() => failed++);
      }
    }
    // 저장 직후 무효화는 사진 정리 전이라 한 번 더 - 상세가 지운 · 새 사진을 바로 보여주게
    await Promise.all([
      qc.invalidateQueries({ queryKey: queryKeys.posts.all }),
      qc.invalidateQueries({ queryKey: queryKeys.user.postsAll }),
    ]);
    const notes = [
      failed > 0 && `사진 ${failed}장을 올리지 못했어요.`,
      notDeleted > 0 && `사진 ${notDeleted}장을 지우지 못했어요.`,
    ].filter(Boolean);
    if (notes.length > 0) window.alert(`${notes.join(" ")} 글 수정에서 다시 해 주세요.`);
    router.push(`/posts/${saved.id}`);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 pb-8 pt-28 md:pt-32">
      <p className="mb-2 text-sm tabular-nums text-muted-foreground">{step} / 2</p>
      <h1 className="mb-8 font-serif text-[32px] leading-tight tracking-tight md:text-[40px]">
        {step === 1 ? "어디서 무엇을 했나요" : editing ? "글 수정" : "들른 곳과 이야기"}
      </h1>

      {step === 1 && (
        <div className="flex flex-col gap-8">
          <Field label="카테고리" htmlFor="category">
            <Chips
              id="category"
              items={categories ?? []}
              value={categoryId}
              onChange={(v) => {
                setCategoryId(v);
                setSubCategoryId(undefined);
              }}
            />
          </Field>
          {categoryId && (
            <Field label="세부 테마" htmlFor="subCategory">
              <Chips
                id="subCategory"
                items={subCategories ?? []}
                value={subCategoryId}
                onChange={setSubCategoryId}
              />
            </Field>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="지역" htmlFor="region">
              <select
                id="region"
                className={inputClass}
                value={regionId ?? ""}
                onChange={(e) => {
                  setRegionId(e.target.value ? Number(e.target.value) : undefined);
                  setCityId(undefined);
                }}
              >
                <option value="">지역 선택</option>
                {regions?.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="도시" htmlFor="city">
              <select
                id="city"
                className={inputClass}
                disabled={!regionId}
                value={cityId ?? ""}
                onChange={(e) => setCityId(e.target.value ? Number(e.target.value) : undefined)}
              >
                <option value="">도시 선택</option>
                {cities?.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="flex justify-end border-t pt-6">
            <button
              type="button"
              disabled={!step1Done}
              onClick={() => setStep(2)}
              className={buttonClass.primary}
            >
              다음
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        // form 이 아니라 fieldset - 장소 검색 · 메모 칸에서 Enter 를 눌러도 글이 저장되지 않게 (저장은 버튼으로만)
        // 저장하는 동안엔 입력 · 취소를 막음 - 보낸 뒤 고친 내용이 사라지거나 취소 후 상세로 튀지 않게
        <fieldset disabled={saving} className="flex min-w-0 flex-col gap-10">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="-mt-4 self-start text-sm text-ink-2 underline underline-offset-4 hover:text-foreground"
          >
            {[
              categories?.find((c) => c.id === categoryId)?.name,
              allSubs.find((s) => s.id === subCategoryId)?.name ??
                initial?.category.subCategoryName,
              regions?.find((r) => r.id === regionId)?.name,
              cityName,
            ]
              .filter(Boolean)
              .join(" · ")}{" "}
            바꾸기
          </button>

          <section aria-labelledby="places-title">
            <h2 id="places-title" className="mb-1 text-lg font-medium">
              들른 곳
            </h2>
            <p className="mb-4 text-sm tabular-nums text-ink-2">
              들른 순서대로 {MAX_PLACES}곳까지 · 지금 {places.length}곳
            </p>
            <PlaceSearch
              cityName={cityName}
              disabled={places.length >= MAX_PLACES}
              onAdd={(p) => {
                // 카카오 분류가 '카페' 면 종류도 카페로 미리 골라둠
                const cafe =
                  p.groupName === "카페" ? allSubs.find((s) => s.name === "카페")?.id : undefined;
                setPlaces((ps) => [
                  ...ps,
                  { ...p, key: newKey(), subCategoryId: cafe, images: [], files: [] },
                ]);
              }}
            />
            {places.length > 0 && (
              <>
                <ol className="mt-4 flex flex-col gap-3">
                  {places.map((p, i) => (
                    <PlaceItem
                      key={p.key}
                      place={p}
                      index={i}
                      total={places.length}
                      groups={groups}
                      onChange={(patch) => patchPlace(p.key, patch)}
                      onMove={(to) => movePlace(i, to)}
                      onRemove={() => {
                        // 저장된 장소를 빼면 그 장소 사진은 글 전체 사진으로 남음(BE) - 화면에서도 옮겨 보여줌
                        setPostImages((xs) => [...xs, ...p.images]);
                        setPlaces((ps) => ps.filter((x) => x.key !== p.key));
                      }}
                      onRemoveImage={removeImage}
                    />
                  ))}
                </ol>
                <div className="mt-4 overflow-hidden rounded-2xl border">
                  <RouteMap stops={places} className="aspect-[16/9] w-full" />
                </div>
              </>
            )}
          </section>

          <section className="flex flex-col gap-4" aria-label="글">
            <Field label="제목" htmlFor="title">
              <input
                id="title"
                maxLength={100}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예) 부산 원도심 골목 하루"
                className={inputClass}
              />
            </Field>
            <Field label="한 줄 요약 (선택)" htmlFor="summary">
              <input
                id="summary"
                maxLength={200}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="예) 감천마을에서 영도까지 걸어서"
                className={inputClass}
              />
            </Field>
            <Field label="본문" htmlFor="content">
              <textarea
                id="content"
                maxLength={10000}
                rows={10}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={cn(inputClass, "leading-7")}
              />
            </Field>
          </section>

          <PostPhotos
            images={postImages}
            files={postFiles}
            remaining={MAX_POST_PHOTOS - photoTotal}
            onAdd={(fs) => setPostFiles((xs) => [...xs, ...fs])}
            onRemoveFile={(i) => setPostFiles((xs) => xs.filter((_, j) => j !== i))}
            onRemoveImage={removeImage}
          />

          <div className="flex flex-col gap-3 border-t pt-6">
            <ErrorText message={error} />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => router.back()} className={buttonClass.ghost}>
                취소
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={saving}
                className={buttonClass.primary}
              >
                {saving ? "저장하는 중" : editing ? "수정하기" : "올리기"}
              </button>
            </div>
          </div>
        </fieldset>
      )}
    </div>
  );
}

function Chips<T extends { id: number; name: string }>({
  id,
  items,
  value,
  onChange,
}: {
  id: string;
  items: T[];
  value?: number;
  onChange: (id: number) => void;
}) {
  return (
    <div id={id} className="flex flex-wrap gap-2" role="group">
      {items.map((it) => (
        <button
          key={it.id}
          type="button"
          aria-pressed={it.id === value}
          onClick={() => onChange(it.id)}
          className={cn(
            "h-9 rounded-full border px-3.5 text-sm transition-colors",
            it.id === value
              ? "border-primary bg-primary text-primary-foreground"
              : "bg-card text-ink-2 hover:text-foreground"
          )}
        >
          {it.name}
        </button>
      ))}
    </div>
  );
}

// 장소에 묶이지 않는 글 전체 사진
function PostPhotos({
  images,
  files,
  remaining,
  onAdd,
  onRemoveFile,
  onRemoveImage,
}: {
  images: ImageResponse[];
  files: File[];
  remaining: number;
  onAdd: (files: File[]) => void;
  onRemoveFile: (index: number) => void;
  onRemoveImage: (image: ImageResponse) => void;
}) {
  const previews = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => previews.forEach((u) => URL.revokeObjectURL(u)), [previews]);
  return (
    <section aria-labelledby="photos-title">
      <h2 id="photos-title" className="mb-1 text-lg font-medium">
        글 전체 사진 (선택)
      </h2>
      <p className="mb-4 text-sm text-ink-2">
        특정 장소에 묶이지 않는 사진 · 첫 장이 목록 썸네일이 돼요
      </p>
      <div className="flex flex-wrap gap-2">
        {images.map((img) => (
          <Photo key={img.id} src={img.url} onRemove={() => onRemoveImage(img)} />
        ))}
        {previews.map((url, i) => (
          <Photo key={url} src={url} onRemove={() => onRemoveFile(i)} />
        ))}
        {remaining > 0 && (
          <label className="grid size-24 cursor-pointer place-items-center rounded-lg border border-dashed text-muted-foreground hover:text-foreground">
            <span className="flex flex-col items-center gap-1 text-xs">
              <ImagePlus className="size-5" strokeWidth={1.5} />
              사진 추가
            </span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="sr-only"
              onChange={(e) => {
                onAdd(Array.from(e.target.files ?? []).slice(0, remaining));
                e.target.value = "";
              }}
            />
          </label>
        )}
      </div>
    </section>
  );
}

function Photo({ src, onRemove }: { src: string; onRemove: () => void }) {
  return (
    <span className="relative size-24 overflow-hidden rounded-lg bg-secondary">
      <Image
        src={src}
        alt=""
        fill
        unoptimized={src.startsWith("blob:") || !isOptimizable(src)}
        sizes="96px"
        className="object-cover"
      />
      <button
        type="button"
        aria-label="사진 빼기"
        onClick={onRemove}
        className="absolute right-1 top-1 grid size-6 place-items-center rounded-full bg-black/60 text-white"
      >
        <X className="size-3.5" strokeWidth={2} />
      </button>
    </span>
  );
}
