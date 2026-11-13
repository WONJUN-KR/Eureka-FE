export const ENDPOINTS = {
  AUTH: {
    SIGNUP: "/api/auth/signup",
    LOGIN: "/api/auth/login",
    REISSUE: "/api/auth/reissue",
    // 카카오 로그인 시작(BE 가 카카오로 302) - fetch 말고 브라우저 이동
    KAKAO: "/api/auth/kakao",
  },
  USERS: {
    ME: "/api/users/me",
    UPDATE: "/api/users/me",
    DELETE: "/api/users/me",
    MY_POSTS: "/api/users/me/posts",
    PROFILE: (id: number) => `/api/users/${id}`,
    POSTS: (id: number) => `/api/users/${id}/posts`,
  },
  POSTS: {
    LIST: "/api/posts",
    CREATE: "/api/posts",
    DETAIL: (id: number) => `/api/posts/${id}`,
    UPDATE: (id: number) => `/api/posts/${id}`,
    DELETE: (id: number) => `/api/posts/${id}`,
  },
  IMAGES: {
    UPLOAD: (postId: number) => `/api/posts/${postId}/images`,
    LIST: (postId: number) => `/api/posts/${postId}/images`,
    DELETE: (id: number) => `/api/images/${id}`,
  },
  LIKES: {
    TOGGLE: (postId: number) => `/api/posts/${postId}/like`,
    STATUS: (postId: number) => `/api/posts/${postId}/like`,
  },
  REGIONS: {
    LIST: "/api/regions",
    CITIES: (regionId: number) => `/api/regions/${regionId}/cities`,
  },
  CATEGORIES: {
    LIST: "/api/categories",
    SUB: (categoryId: number) => `/api/categories/${categoryId}/sub`,
  },
} as const;
