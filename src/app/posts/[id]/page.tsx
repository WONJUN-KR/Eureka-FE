"use client";

import { ChevronLeft, ChevronRight, Clock, Heart, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { useDeletePost, useToggleLike } from "@/api/mutations";
import { useLikeStatus, useMe, usePost, usePostImages, usePosts } from "@/api/queries";
import { getErrorMessage } from "@/api/request";
import type { ImageResponse, PlaceResponse } from "@/api/types";
import RouteMap from "@/components/map/RouteMap";
import PostCard from "@/components/PostCard";
import ReportButton from "@/components/ReportDialog";
import { buttonClass } from "@/components/ui/field";
import SectionHead from "@/components/ui/SectionHead";
import { cn, formatDate, isOptimizable } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";

// 글 상세: 제목 · 사진 · 본문 · 들른 곳(순서 · 시간 · 종류 · 메모 · 사진) · 오른쪽 경로 지도 · 같은 도시 글
// 원본 read.jsp 는 목록 위에 뜨는 창이었는데 주소로 공유할 수 있게 페이지로 둠. '신고'는 BE 기능이 없어서 뺌
export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>();
  const postId = Number(id);
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const loggedIn = isHydrated && isAuthenticated;
  // 삭제한 뒤엔 이 글 조회를 멈춤 (목록으로 가기 전에 다시 불러서 404 나지 않게)
  const [deleted, setDeleted] = useState(false);
  const [active, setActive] = useState<number>();
  // 크게 보기: 어떤 사진 묶음(글 사진 / 장소 사진)의 몇 번째인지
  const [viewer, setViewer] = useState<{ images: ImageResponse[]; index: number } | null>(null);

  const { data: post, isLoading, isError, error } = usePost(postId, !deleted);
  const {
    data: images = [],
    isLoading: imagesLoading,
    isError: imagesError,
  } = usePostImages(postId, !deleted);
  const { data: like } = useLikeStatus(postId, loggedIn && !deleted);
  const { data: me } = useMe(loggedIn);
  const { data: sameCity } = usePosts({ cityId: post?.location.cityId, size: 4 }, post != null);
  const toggleLike = useToggleLike(postId);
  const deletePost = useDeletePost();

  const wrap = "mx-auto max-w-6xl px-4 pb-8 pt-28 md:px-8 md:pt-32";
  // 받아오는 동안 제목 · 사진 자리를 같은 크기로 (내용이 들어와도 아래가 밀리지 않게)
  if (isLoading)
    return (
      <div className={wrap} aria-busy="true">
        <div className="mb-4 h-5 w-64 rounded bg-secondary" />
        <div className="mb-6 h-12 w-2/3 rounded bg-secondary" />
        <div className="mt-9 h-[300px] animate-pulse rounded-2xl bg-secondary motion-reduce:animate-none md:h-[520px]" />
      </div>
    );
  if (isError || !post)
    return (
      <p className={cn(wrap, "text-center text-destructive")}>
        {getErrorMessage(error) || "게시글이 없어요."}
      </p>
    );

  const places = post.places ?? [];
  const isMine = me?.id === post.author.id;
  const liked = like?.liked ?? false;
  const likeCount = like?.likeCount ?? post.likeCount;
  const others = (sameCity?.content ?? []).filter((p) => p.id !== post.id).slice(0, 3);
  // 위 사진 칸에는 글 전체 사진만 - 장소 사진은 들른 곳 안에서 보여줌
  const postImages = images.filter((x) => x.placeId == null);
  // 지도 · 오른쪽 목록에서 장소를 고르면 본문의 그 장소로 스크롤 + 키보드 포커스도 그 장소 번호로
  const focusStop = (i: number) => {
    setActive(i);
    const stop = document.getElementById(`stop-${i}`);
    stop?.scrollIntoView({ behavior: "smooth", block: "center" });
    stop?.querySelector("button")?.focus({ preventScroll: true });
  };

  return (
    <div className={wrap}>
      <nav className="mb-5 flex flex-wrap gap-2 text-sm text-muted-foreground" aria-label="위치">
        <Link href="/posts" className="hover:text-foreground">
          전체 글
        </Link>
        <span aria-hidden>/</span>
        <Link href={`/posts?regionId=${post.location.regionId}`} className="hover:text-foreground">
          {post.location.regionName}
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/posts?regionId=${post.location.regionId}&cityId=${post.location.cityId}`}
          className="hover:text-foreground"
        >
          {post.location.cityName}
        </Link>
        <span aria-hidden>/</span>
        <Link
          href={`/posts?categoryId=${post.category.categoryId}&subCategoryId=${post.category.subCategoryId}`}
          className="hover:text-foreground"
        >
          {post.category.categoryName} · {post.category.subCategoryName}
        </Link>
      </nav>

      <h1 className="mb-5 max-w-3xl font-serif text-[30px] leading-[1.3] tracking-tight md:text-[44px]">
        {post.title}
      </h1>
      <p className="flex flex-wrap items-center gap-2 text-[15px] tabular-nums text-muted-foreground">
        <Link
          href={`/users/${post.author.id}`}
          className="inline-flex items-center gap-2.5 font-medium text-foreground hover:underline hover:underline-offset-4"
        >
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-full bg-[#d9d0bf] text-[13px] text-ink-2"
          >
            {post.author.nickname.slice(0, 1)}
          </span>
          {post.author.nickname}
        </Link>
        <span aria-hidden>·</span>
        <span>{formatDate(post.createdAt)}</span>
        <span aria-hidden>·</span>
        <span>조회 {post.viewCount}</span>
        <span aria-hidden>·</span>
        <span>좋아요 {likeCount}</span>
        {places.length > 0 && (
          <>
            <span aria-hidden>·</span>
            <span>{places.length}곳</span>
          </>
        )}
      </p>

      {/* 사진을 받는 동안엔 사진 칸 자리를 잡아둠 - 본문을 읽다가 사진이 끼어들어 밀리지 않게 */}
      {imagesLoading ? (
        <div className="mt-9 h-[300px] animate-pulse rounded-2xl bg-secondary motion-reduce:animate-none md:h-[520px]" />
      ) : imagesError ? (
        <p className="mt-9 text-sm text-muted-foreground">사진을 불러오지 못했어요.</p>
      ) : (
        <Gallery
          images={postImages}
          title={post.title}
          onOpen={(index) => setViewer({ images: postImages, index })}
        />
      )}

      <div className="grid gap-12 pt-12 md:grid-cols-[minmax(0,1fr)_360px] md:gap-[72px] md:pt-14">
        <article className="min-w-0">
          {post.summary && (
            <p className="mb-7 font-serif text-xl leading-relaxed">{post.summary}</p>
          )}
          <div className="max-w-[680px] whitespace-pre-wrap text-[17px] leading-[1.85]">
            {post.content}
          </div>

          {places.length > 0 && (
            <section className="mt-14" aria-labelledby="stops-title">
              <h2 id="stops-title" className="mb-2 font-serif text-2xl tracking-tight">
                들른 곳
              </h2>
              <p className="mb-6 text-[15px] text-ink-2">순서대로 다녀온 {places.length}곳</p>
              <ol>
                {places.map((pl, i) => (
                  <Stop
                    key={pl.id}
                    place={pl}
                    index={i}
                    last={i === places.length - 1}
                    active={active === i}
                    onFocus={() => setActive(i)}
                    onOpenImage={(index) => setViewer({ images: pl.images ?? [], index })}
                  />
                ))}
              </ol>
            </section>
          )}

          <div className="mt-12 flex flex-wrap items-center gap-3 border-t pt-7">
            <button
              type="button"
              onClick={() => (loggedIn ? toggleLike.mutate() : router.push("/login"))}
              disabled={toggleLike.isPending}
              aria-pressed={liked}
              className={cn(
                buttonClass.ghost,
                "tabular-nums",
                liked && "border-trail/35 text-trail"
              )}
            >
              <Heart
                className={cn("size-[18px]", liked && "fill-trail")}
                strokeWidth={1.5}
                aria-hidden
              />
              좋아요 {likeCount}
            </button>
            <Link href="/posts" className={buttonClass.ghost}>
              목록으로
            </Link>
            {/* 신고는 로그인한 사람이 남의 글에만 */}
            {loggedIn && me && !isMine && (
              <div className="ml-auto">
                <ReportButton postId={post.id} />
              </div>
            )}
            {isMine && (
              <div className="ml-auto flex gap-2">
                <Link
                  href={`/posts/${post.id}/edit`}
                  className={cn(buttonClass.ghost, "h-9 px-3.5 text-sm")}
                >
                  수정
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    if (!window.confirm("이 글을 지울까요? 지운 글은 되돌릴 수 없어요.")) return;
                    deletePost.mutate(post.id, {
                      onSuccess: () => {
                        setDeleted(true);
                        router.replace("/posts");
                      },
                    });
                  }}
                  disabled={deletePost.isPending}
                  className={cn(buttonClass.ghost, "h-9 px-3.5 text-sm text-destructive")}
                >
                  삭제
                </button>
              </div>
            )}
          </div>
        </article>

        {places.length > 0 && (
          <aside className="md:sticky md:top-24 md:self-start">
            <div className="rounded-2xl border bg-card p-6">
              <h2 className="mb-1 text-base font-medium">이 여행의 경로</h2>
              <p className="mb-4 text-sm tabular-nums text-muted-foreground">
                {post.location.cityName} · {places.length}곳 · 들른 순서대로
              </p>
              <RouteMap
                stops={places}
                active={active}
                onSelect={focusStop}
                className="aspect-[4/3] w-full rounded-xl"
              />
              <Link
                href={`/users/${post.author.id}`}
                className="mt-4 block text-sm text-ink-2 underline-offset-4 hover:text-foreground hover:underline"
              >
                {post.author.nickname}의 다른 여행 보기 →
              </Link>
              <ol className="mt-4 text-sm">
                {places.map((pl, i) => (
                  <li key={pl.id}>
                    <button
                      type="button"
                      onClick={() => focusStop(i)}
                      className={cn(
                        "grid w-full grid-cols-[22px_1fr_auto] gap-2 border-t py-2 text-left",
                        active === i ? "font-medium text-trail" : "text-ink-2 hover:text-foreground"
                      )}
                    >
                      <span className="tabular-nums text-muted-foreground">{i + 1}</span>
                      <span className="truncate">{pl.name}</span>
                      <span className="tabular-nums text-muted-foreground">
                        {pl.visitedAt ?? ""}
                      </span>
                    </button>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        )}
      </div>

      {others.length > 0 && (
        <section className="pt-24">
          <SectionHead
            title={`${post.location.cityName}의 다른 기록`}
            more={{
              href: `/posts?regionId=${post.location.regionId}&cityId=${post.location.cityId}`,
              label: "더 보기",
            }}
          />
          <div className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      )}

      {viewer && (
        <Viewer
          images={viewer.images}
          index={viewer.index}
          onChange={(index) => setViewer({ ...viewer, index })}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  );
}

// 사진 칸: 첫 장 크게 + 둘째 장, 나머지는 장수만 - 누르면 크게 보기
function Gallery({
  images,
  title,
  onOpen,
}: {
  images: ImageResponse[];
  title: string;
  onOpen: (index: number) => void;
}) {
  if (images.length === 0) return null;
  const shown = images.slice(0, 2);
  return (
    <div
      className={cn(
        "mt-9 grid h-[300px] gap-3 md:h-[520px]",
        shown.length > 1 ? "grid-cols-1 md:grid-cols-[2fr_1fr]" : "grid-cols-1"
      )}
    >
      {shown.map((img, i) => (
        <button
          key={img.id}
          type="button"
          onClick={() => onOpen(i)}
          aria-label={`${title} 사진 ${i + 1} 크게 보기`}
          className={cn(
            "relative overflow-hidden rounded-2xl bg-secondary",
            i === 1 && "hidden md:block"
          )}
        >
          <Image
            src={img.url}
            alt=""
            fill
            priority={i === 0}
            unoptimized={!isOptimizable(img.url)}
            sizes={i === 0 ? "(min-width: 768px) 760px, 100vw" : "380px"}
            className="object-cover"
          />
          {/* 장수 표시: 휴대폰은 첫 장만 보여서 첫 장에, 넓은 화면은 마지막 칸에 */}
          {images.length > 1 && (i === 0 || i === shown.length - 1) && (
            <span
              className={cn(
                "absolute bottom-4 right-4",
                shown.length > 1 && (i === 0 ? "md:hidden" : "hidden md:block"),
                " rounded-md bg-black/60 px-2.5 py-1 text-[13px] tabular-nums text-white"
              )}
            >
              사진 {images.length}장
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

// 들른 곳 한 칸: 번호 · 들른 시간 · 장소 이름 · 종류 · 주소 · 메모 · 장소 사진
function Stop({
  place,
  index,
  last,
  active,
  onFocus,
  onOpenImage,
}: {
  place: PlaceResponse;
  index: number;
  last: boolean;
  active: boolean;
  onFocus: () => void;
  onOpenImage: (index: number) => void;
}) {
  const pics = place.images ?? [];
  return (
    <li id={`stop-${index}`} className="relative grid grid-cols-[36px_1fr] gap-4 pb-8">
      {/* 다음 장소로 이어지는 점선 */}
      {!last && (
        <span
          aria-hidden
          className="absolute bottom-0 left-[17px] top-10 border-l-2 border-dotted border-trail/60"
        />
      )}
      <button
        type="button"
        onClick={onFocus}
        aria-label={`${index + 1}번 장소 지도에서 보기`}
        className={cn(
          "relative z-[1] grid size-9 place-items-center rounded-full border-[1.5px] text-sm font-medium tabular-nums",
          active ? "border-trail bg-trail text-card" : "border-ink-2 bg-card"
        )}
      >
        {index + 1}
      </button>
      <div className="min-w-0 pt-1">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="text-[17px] font-medium">{place.name}</h3>
          {place.subCategoryName && (
            <span className="text-sm text-muted-foreground">{place.subCategoryName}</span>
          )}
          {place.visitedAt && (
            <span className="inline-flex items-center gap-1 text-sm tabular-nums text-muted-foreground">
              <Clock className="size-3.5" strokeWidth={1.5} aria-hidden />
              {place.visitedAt}
            </span>
          )}
        </div>
        {place.address && <p className="mt-0.5 text-sm text-muted-foreground">{place.address}</p>}
        {place.memo && <p className="mt-2 text-[15px] text-ink-2">{place.memo}</p>}
        {pics.length > 0 && (
          <div className="mt-3 flex gap-2">
            {pics.map((img, k) => (
              <button
                key={img.id}
                type="button"
                onClick={() => onOpenImage(k)}
                aria-label={`${place.name} 사진 크게 보기`}
                className="relative size-24 overflow-hidden rounded-lg bg-secondary"
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  unoptimized={!isOptimizable(img.url)}
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>
    </li>
  );
}

// 사진 크게 보기 - 좌우 버튼 · 방향키 · Esc
function Viewer({
  images,
  index,
  onChange,
  onClose,
}: {
  images: ImageResponse[];
  index: number;
  onChange: (i: number) => void;
  onClose: () => void;
}) {
  const n = images.length;
  const dialog = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  // 열 때 닫기 버튼으로 포커스, 닫으면 누른 사진 버튼으로 되돌림
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    closeBtn.current?.focus();
    return () => prev?.focus();
  }, []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // 열려 있는 동안 Tab 은 뷰어 버튼 안에서만 돎
      if (e.key === "Tab" && dialog.current) {
        const items = [...dialog.current.querySelectorAll<HTMLElement>("button")];
        const first = items[0];
        const last = items[items.length - 1];
        if (!dialog.current.contains(document.activeElement)) {
          e.preventDefault();
          first?.focus();
        } else if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onChange((index - 1 + n) % n);
      if (e.key === "ArrowRight") onChange((index + 1) % n);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [index, n, onChange, onClose]);

  const img = images[index];
  return (
    <div
      ref={dialog}
      role="dialog"
      aria-modal="true"
      aria-label="사진 크게 보기"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4"
      onClick={onClose}
    >
      <div className="relative h-[80vh] w-full max-w-5xl" onClick={(e) => e.stopPropagation()}>
        <Image
          src={img.url}
          alt=""
          fill
          unoptimized={!isOptimizable(img.url)}
          sizes="100vw"
          className="object-contain"
        />
      </div>
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm tabular-nums text-white/80">
        {index + 1} / {n}
      </p>
      <button
        ref={closeBtn}
        type="button"
        onClick={onClose}
        aria-label="닫기"
        className="absolute right-4 top-4 rounded-full p-2 text-white/80 hover:text-white"
      >
        <X className="size-6" strokeWidth={1.5} />
      </button>
      {n > 1 && (
        <>
          <button
            type="button"
            aria-label="이전 사진"
            onClick={(e) => {
              e.stopPropagation();
              onChange((index - 1 + n) % n);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/80 hover:text-white"
          >
            <ChevronLeft className="size-8" strokeWidth={1.5} />
          </button>
          <button
            type="button"
            aria-label="다음 사진"
            onClick={(e) => {
              e.stopPropagation();
              onChange((index + 1) % n);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-white/80 hover:text-white"
          >
            <ChevronRight className="size-8" strokeWidth={1.5} />
          </button>
        </>
      )}
    </div>
  );
}
