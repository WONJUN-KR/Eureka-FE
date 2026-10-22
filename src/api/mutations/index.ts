"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import client from "../client";
import { ENDPOINTS } from "../endpoints";
import { queryKeys } from "../queryKeys";
import { del, post } from "../request";
import type {
  ApiResponse,
  CreatePostRequest,
  ImageResponse,
  LikeResponse,
  PostDetailResponse,
  SignupRequest,
  TokenResponse,
} from "../types";

export function useLogin() {
  return useMutation({
    mutationFn: (body: { email: string; password: string }) =>
      post<TokenResponse>(ENDPOINTS.AUTH.LOGIN, body),
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: (body: SignupRequest) => post<null>(ENDPOINTS.AUTH.SIGNUP, body),
  });
}

export function useCreatePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePostRequest) => post<PostDetailResponse>(ENDPOINTS.POSTS.CREATE, body),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.posts.all }),
  });
}

export function useDeletePost() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => del<null>(ENDPOINTS.POSTS.DELETE(id)),
    // 목록만 갱신. 지운 글의 상세는 화면에서 조회를 끄고 떠남(invalidate·remove 하면 떠나기 전에 다시 불러서 404)
    onSuccess: () => qc.invalidateQueries({ queryKey: ["posts", "list"] }),
  });
}

export function useToggleLike(postId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => post<LikeResponse>(ENDPOINTS.LIKES.TOGGLE(postId)),
    onSuccess: (data) => {
      qc.setQueryData(["posts", "like", postId], data);
      qc.invalidateQueries({ queryKey: queryKeys.posts.detail(postId) });
    },
  });
}

// multipart 라 공통 헤더(Content-Type: application/json)를 덮어씀
export async function uploadImage(postId: number, file: File): Promise<ImageResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await client.post<ApiResponse<ImageResponse>>(ENDPOINTS.IMAGES.UPLOAD(postId), form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data.data;
}
