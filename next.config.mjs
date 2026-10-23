/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 가장 큰 화면(배너 1152px × 2배)에 2048 이면 충분 - 기본값의 3840 은 고해상도 원본을 거의 그대로 보내서 뺌
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    qualities: [70, 75],
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // 백엔드 경로가 /api 로 시작하므로 /api 를 붙여서 전달 (빼면 /api/posts → /posts 로 가서 404)
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/:path*`,
      },
      // 로컬 업로드 이미지(local 프로필은 S3 대신 BE 디스크에 저장하고 /uploads 로 서빙)
      {
        source: "/uploads/:path*",
        destination: `${process.env.NEXT_PUBLIC_API_BASE_URL}/uploads/:path*`,
      },
    ];
  },
};

export default nextConfig;
