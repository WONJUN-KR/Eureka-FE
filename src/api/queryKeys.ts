export const queryKeys = {
  posts: {
    all: ["posts"] as const,
    list: (params?: Record<string, unknown>) => ["posts", "list", params] as const,
    detail: (id: number) => ["posts", "detail", id] as const,
  },
  regions: {
    all: ["regions"] as const,
    cities: (regionId: number) => ["regions", "cities", regionId] as const,
  },
  categories: {
    all: ["categories"] as const,
    sub: (categoryId: number) => ["categories", "sub", categoryId] as const,
  },
  user: {
    all: ["user"] as const,
    me: () => ["user", "me"] as const,
    profile: (id: number) => ["user", "profile", id] as const,
    posts: (id: number) => ["user", "posts", id] as const,
    myPosts: () => ["user", "posts", "me"] as const,
    // 내가 좋아요한 글 - 좋아요를 누르거나 풀면 다시 받음
    myLikes: () => ["user", "likes", "me"] as const,
    // 글을 쓰거나 고치거나 지우면 사람별 글 목록 · 글 수도 다시 받아야 함
    postsAll: ["user", "posts"] as const,
    profileAll: ["user", "profile"] as const,
  },
} as const;
