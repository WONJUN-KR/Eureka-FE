/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
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
