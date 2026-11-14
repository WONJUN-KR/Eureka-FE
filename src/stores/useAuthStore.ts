"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

interface AuthActions {
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setHydrated: () => void;
}

type AuthStore = AuthState & AuthActions;

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isHydrated: false,

      login: (accessToken: string, refreshToken: string) => {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        set({
          accessToken,
          refreshToken,
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      setHydrated: () => {
        set({ isHydrated: true });
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
      // 저장소를 못 읽거나 깨져 있어도(state 가 undefined) 복원은 끝난 것으로 - 로그인 안 된 상태로 화면이 넘어가게
      // (복원은 store 를 만드는 중에 돌아서 useAuthStore 대신 시작 상태의 setHydrated 를 씀)
      onRehydrateStorage: (initial) => () => {
        initial.setHydrated();
      },
    }
  )
);

// localStorage 가 막힌 환경(개인 정보 보호 모드 등)에선 persist 가 복원을 시작하지 않아 위 콜백도 안 옴
// (저장소가 없으면 persist 기능 자체가 빠진 store 가 만들어짐)
// 저장값이 깨져 복원이 store 생성 중에 실패하면 위 콜백이 켠 isHydrated 가 시작 상태로 덮임 -> hasHydrated() 가 false 라 여기서 다시 켬
if (
  typeof window !== "undefined" &&
  (!useAuthStore.persist || !useAuthStore.persist.hasHydrated())
) {
  // setState 는 저장소에도 바로 저장함 - 저장이 실패해도(용량 초과 등) 메모리 상태는 이미 바뀌어 있으니 예외만 삼킴
  // (여기서 예외가 나면 이 파일을 쓰는 화면 전체가 안 뜸)
  try {
    useAuthStore.setState({ isHydrated: true });
  } catch {
    // 저장 실패는 무시 - 로그인 상태는 이번 로드 동안 메모리에만 있음
  }
}
