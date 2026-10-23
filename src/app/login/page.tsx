"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { useLogin, useSignup } from "@/api/mutations";
import { getErrorMessage } from "@/api/request";
import type { Gender, SignupRequest } from "@/api/types";
import { ErrorText, Field, inputClass, SubmitButton } from "@/components/ui/field";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/useAuthStore";

// 원본 loginAndJoin.jsp: 'Login | Join' 탭 하나에 로그인·회원가입, 로그인 쪽 아래에 검은 로고
// 원본의 아이디·비밀번호 찾기는 BE 기능이 없어서 뺌. 원본 ID 대신 지금 BE 는 이메일로 로그인
const BLUE = "rgb(6,119,207)";

function LoginForm() {
  const router = useRouter();
  const login = useAuthStore((s) => s.login);
  const mutation = useLogin();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate(
          { email, password },
          {
            onSuccess: (t) => {
              login(t.accessToken, t.refreshToken);
              router.push("/");
            },
          }
        );
      }}
      className="mx-auto flex max-w-sm flex-col gap-4"
    >
      <Field label="이메일" htmlFor="email">
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="비밀번호" htmlFor="password">
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={inputClass}
        />
      </Field>
      <ErrorText message={mutation.isError ? getErrorMessage(mutation.error) : null} />
      <SubmitButton pending={mutation.isPending}>로 그 인</SubmitButton>
      <Image
        src="/images/headerImages/blackLogo.png"
        alt=""
        width={160}
        height={80}
        className="mx-auto mt-6 h-auto w-40 opacity-80"
      />
    </form>
  );
}

function JoinForm({ onDone }: { onDone: () => void }) {
  const mutation = useSignup();
  const [form, setForm] = useState<SignupRequest>({
    email: "",
    password: "",
    nickname: "",
    name: "",
  });
  const set =
    (key: keyof SignupRequest) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value || undefined }));

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        mutation.mutate(form, { onSuccess: onDone });
      }}
      className="mx-auto flex max-w-sm flex-col gap-4"
    >
      <Field label="이메일" htmlFor="joinEmail">
        <input
          id="joinEmail"
          type="email"
          required
          autoComplete="email"
          onChange={set("email")}
          className={inputClass}
        />
      </Field>
      <Field label="비밀번호 (8자 이상)" htmlFor="joinPassword">
        <input
          id="joinPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          onChange={set("password")}
          className={inputClass}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="닉네임" htmlFor="nickname">
          <input
            id="nickname"
            required
            minLength={2}
            maxLength={20}
            onChange={set("nickname")}
            className={inputClass}
          />
        </Field>
        <Field label="이름" htmlFor="name">
          <input
            id="name"
            required
            minLength={2}
            maxLength={20}
            onChange={set("name")}
            className={inputClass}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="생년월일 (선택)" htmlFor="birth">
          <input id="birth" type="date" onChange={set("birth")} className={inputClass} />
        </Field>
        <Field label="성별 (선택)" htmlFor="gender">
          <select id="gender" defaultValue="" onChange={set("gender")} className={inputClass}>
            <option value="">선택 안 함</option>
            {(["MALE", "FEMALE", "OTHER"] as Gender[]).map((g) => (
              <option key={g} value={g}>
                {{ MALE: "남성", FEMALE: "여성", OTHER: "기타" }[g]}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <ErrorText message={mutation.isError ? getErrorMessage(mutation.error) : null} />
      <SubmitButton pending={mutation.isPending}>회 원 가 입</SubmitButton>
    </form>
  );
}

function LoginAndJoin() {
  const sp = useSearchParams();
  const [tab, setTab] = useState<"login" | "join">(sp.get("tab") === "join" ? "join" : "login");
  const [joined, setJoined] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-4 pb-8 pt-24 md:pt-32">
      <div className="flex pl-0 md:pl-8" role="tablist">
        {(["login", "join"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "h-16 w-36 border border-b-0 font-bold md:h-20 md:w-48",
              tab === t ? "bg-neutral-50 text-xl" : "bg-white text-neutral-500"
            )}
            style={tab === t ? { borderTop: `2px solid ${BLUE}` } : undefined}
          >
            {t === "login" ? "Login" : "Join"}
          </button>
        ))}
      </div>
      <div
        className="border border-t-0 border-b-black bg-neutral-50 px-4 py-12"
        style={{ borderBottomWidth: 2 }}
      >
        {joined && tab === "login" && (
          <p className="mb-6 text-center text-sm" style={{ color: BLUE }}>
            가입이 완료됐어요. 로그인해주세요.
          </p>
        )}
        {tab === "login" ? (
          <LoginForm />
        ) : (
          <JoinForm
            onDone={() => {
              setJoined(true);
              setTab("login");
            }}
          />
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    // 대체 화면을 탭+폼 높이로 잡아 탭이 들어올 때 푸터가 밀리지 않게 (CLS)
    <Suspense fallback={<div className="mx-auto min-h-[760px] max-w-3xl px-4 pt-24 md:pt-32" />}>
      <LoginAndJoin />
    </Suspense>
  );
}
