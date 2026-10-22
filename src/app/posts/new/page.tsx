"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { uploadImage, useCreatePost } from "@/api/mutations";
import { useCategories, useCities, useRegions, useSubCategories } from "@/api/queries";
import { getErrorMessage } from "@/api/request";
import { ErrorText, Field, inputClass, SubmitButton } from "@/components/ui/field";
import { useAuthStore } from "@/stores/useAuthStore";

const toId = (v: string) => (v ? Number(v) : undefined);

export default function NewPostPage() {
  const router = useRouter();
  const { isAuthenticated, isHydrated } = useAuthStore();
  const [regionId, setRegionId] = useState<number>();
  const [cityId, setCityId] = useState<number>();
  const [categoryId, setCategoryId] = useState<number>();
  const [subCategoryId, setSubCategoryId] = useState<number>();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const { data: regions } = useRegions();
  const { data: cities } = useCities(regionId);
  const { data: categories } = useCategories();
  const { data: subCategories } = useSubCategories(categoryId);
  const create = useCreatePost();

  // 원본 sidebar.jsp 의 글쓰기 창(카테고리 → 지역 → 세부 지역 → 세부 테마 순)을 페이지로
  // 비로그인은 로그인 화면으로 (글 작성 API 는 토큰 필요)
  useEffect(() => {
    if (isHydrated && !isAuthenticated) router.replace("/login");
  }, [isHydrated, isAuthenticated, router]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cityId || !subCategoryId) return;
    create.mutate(
      { cityId, subCategoryId, title, content, summary: summary || undefined },
      {
        onSuccess: async (post) => {
          // 이미지는 글이 만들어진 뒤 글 번호로 올림 - 실패해도 글은 남기고 상세로 이동
          try {
            for (const f of files) await uploadImage(post.id, f);
          } catch (err) {
            setUploadError(`이미지 업로드 실패: ${getErrorMessage(err)}`);
          }
          router.push(`/posts/${post.id}`);
        },
      }
    );
  };

  if (!isHydrated || !isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-2xl px-4 pb-8 pt-24 md:pt-32">
      <h1 className="mb-2 text-center text-2xl font-bold">게시물 올리기</h1>
      <div className="mx-auto mb-8 max-w-md border-b-2 border-black" />
      <form onSubmit={onSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="카테고리" htmlFor="category">
            <select
              id="category"
              required
              className={inputClass}
              value={categoryId ?? ""}
              onChange={(e) => {
                setCategoryId(toId(e.target.value));
                setSubCategoryId(undefined);
              }}
            >
              <option value="">선택</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="지역" htmlFor="region">
            <select
              id="region"
              required
              className={inputClass}
              value={regionId ?? ""}
              onChange={(e) => {
                setRegionId(toId(e.target.value));
                setCityId(undefined);
              }}
            >
              <option value="">선택</option>
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
              required
              disabled={!regionId}
              className={inputClass}
              value={cityId ?? ""}
              onChange={(e) => setCityId(toId(e.target.value))}
            >
              <option value="">선택</option>
              {cities?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="세부 테마" htmlFor="subCategory">
            <select
              id="subCategory"
              required
              disabled={!categoryId}
              className={inputClass}
              value={subCategoryId ?? ""}
              onChange={(e) => setSubCategoryId(toId(e.target.value))}
            >
              <option value="">선택</option>
              {subCategories?.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="제목" htmlFor="title">
          <input
            id="title"
            required
            maxLength={100}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="한 줄 요약 (선택, 200자)" htmlFor="summary">
          <input
            id="summary"
            maxLength={200}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="내용" htmlFor="content">
          <textarea
            id="content"
            required
            maxLength={10000}
            rows={10}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="사진 (선택)" htmlFor="images">
          <input
            id="images"
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            className="text-sm"
          />
        </Field>
        <ErrorText message={create.isError ? getErrorMessage(create.error) : uploadError} />
        <SubmitButton pending={create.isPending}>등록하기</SubmitButton>
      </form>
    </div>
  );
}
