# Eureka - 여행 발자취 커뮤니티

여행했던 지역의 경로를 기록하고 공유하는 **여행 커뮤니티 서비스**의 프론트엔드입니다.

2021년 학원 프로젝트 "유레카"를 Spring Boot + Next.js로 마이그레이션한 프로젝트입니다.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v3 + shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: TanStack React Query
- **HTTP Client**: Axios
- **Font**: Pretendard

---

## Features (v1)

1. 회원가입 / 로그인 (JWT)
2. 여행 게시글 작성 / 수정 / 삭제
3. 지역별 / 카테고리별 필터링
4. 게시글 좋아요
5. 이미지 업로드

---

## Roadmap

| 버전 | 내용                                                   |
| ---- | ------------------------------------------------------ |
| v1   | 핵심 UI (회원, 게시글, 지역, 카테고리, 이미지, 좋아요) |
| v2   | 인프라/품질 (Docker, CI/CD, 테스트, 배포 환경)         |
| v3   | 부가 기능 (댓글, 북마크, 신고, 검색)                   |
| v4   | 소셜 기능 (팔로우, 알림, 태그, 대댓글)                 |
| v5   | OAuth, 관리자                                          |

---

## Getting Started

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local

# 개발 서버 실행
npm run dev
```

[http://localhost:3000](http://localhost:3000)에서 확인할 수 있습니다.

## Scripts

| 명령어             | 설명               |
| ------------------ | ------------------ |
| `npm run dev`      | 개발 서버 실행     |
| `npm run build`    | 프로덕션 빌드      |
| `npm run start`    | 프로덕션 서버 실행 |
| `npm run lint`     | ESLint 검사        |
| `npm run lint:fix` | ESLint 자동 수정   |
| `npm run format`   | Prettier 포맷팅    |

## Branch Strategy

- `main` - 프로덕션 배포 브랜치
- `dev` - 개발 통합 브랜치
- `feat/*` - 기능 개발 브랜치
