import { redirect } from "next/navigation";

// 원본처럼 로그인·회원가입이 한 화면(탭)이라 /signup 은 Join 탭으로 보냄
export default function SignupPage() {
  redirect("/login?tab=join");
}
