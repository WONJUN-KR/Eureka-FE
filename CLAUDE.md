# Eureka-FE

여행 한 번에 들른 장소를 순서대로 기록하고 공유하는 '유레카' 프론트엔드. 배포 없이 로컬에서만 돌린다.

## 개발 가이드

| 언제              | 읽을 것                                                                                                                           |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 모든 작업 · PR 전 | [docs/review-rules.md](docs/review-rules.md) - 리뷰에서 반복된 지적을 모은 규칙 · PR 전 체크리스트                                |
| 화면 디자인       | 아이보리 바탕 · 진한 초록 · 명조 제목. 주황(`trail`)은 지도 경로 · 누른 좋아요에만 (`tailwind.config.ts` · `src/app/globals.css`) |
| API 추가          | `src/api/endpoints.ts` · `src/api/types.ts` · `src/api/queries` · `src/api/mutations` · `src/api/queryKeys.ts`                    |

## 스택

- Next.js 16 (App Router, Turbopack) · React 19 · TypeScript
- Tailwind CSS 3
- TanStack Query 5 (서버 상태) · Zustand 5 (로그인 상태, `src/stores/useAuthStore.ts`)
- Axios (`src/api/client.ts` - 토큰 헤더 · 재발급)
- 카카오 지도 JS SDK (지도 · 장소 검색), 키가 없으면 좌표 약도 · 직접 입력

## 실행

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint
npx tsc --noEmit
```

- BE(Eureka-BE)는 로컬 8095. `/api/*` · `/uploads/*` 는 `next.config.mjs` rewrite 로 BE 에 넘긴다.
- `.env.local` 에 필요한 키 이름 (값은 레포 · 문서에 쓰지 않는다):
  - `NEXT_PUBLIC_API_BASE_URL` - BE 주소
  - `NEXT_PUBLIC_SITE_URL`
  - `NEXT_PUBLIC_KAKAO_JS_KEY` - 카카오 JavaScript 키 (JavaScript SDK 도메인에 localhost:3000 등록)

## 폴더

```
src/
  app/            페이지 (홈 · posts · posts/[id] · posts/new · posts/[id]/edit · mypage · users/[id] · login · auth/kakao/callback)
  components/     화면 부품 (home · map · editor · ui)
  api/            요청 · 타입 · 쿼리 · 뮤테이션 · 쿼리 키
  hooks/          공용 훅 (useDialogFocus)
  lib/            카카오 SDK · 카카오 로그인 · utils
  stores/         Zustand
docs/             리뷰 규칙
```

## Git

- 브랜치: `feature/` · `fix/` · `docs/` · `chore/` 로 시작, dev 에서 나눔
- PR 대상은 dev, 담당자(assignee) WONJUN-KR. PR 은 기능 단위로 작게
- PR 전: `/code-review` -> 지적 고치기 -> 화면이 바뀌면 unslop 점검 -> PR
- 코드래빗은 PR 열기 · push 때 자동 리뷰. `@coderabbitai review` 댓글은 달지 않는다. 지적을 고친 뒤 재리뷰를 받고 머지
- 머지는 머지 커밋(`gh pr merge --merge`), 스쿼시 X. dev -> main 릴리스도 머지 커밋
- 커밋 · PR 에 `Co-Authored-By` 같은 서명을 넣지 않는다

## 문서

- [docs/review-rules.md](docs/review-rules.md) - 리뷰 규칙 · PR 전 체크리스트
- [README.md](README.md) - 프로젝트 소개
