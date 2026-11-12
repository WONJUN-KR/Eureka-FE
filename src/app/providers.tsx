"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useEffect, useState } from "react";

import { queryKeys } from "@/api/queryKeys";
import { useAuthStore } from "@/stores/useAuthStore";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  // 로그아웃하면 내 정보 · 내 글 같은 사용자 캐시를 비움 - 다른 계정으로 들어왔을 때 이전 계정 것이 보이지 않게
  useEffect(
    () =>
      useAuthStore.subscribe((state, prev) => {
        if (prev.isAuthenticated && !state.isAuthenticated)
          queryClient.removeQueries({ queryKey: queryKeys.user.all });
      }),
    [queryClient]
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
