import { cn } from "@/lib/utils";

// 폼 공통 스타일 - shadcn 컴포넌트 들이기 전 최소 버전
export const inputClass =
  "w-full rounded-[10px] border border-input bg-card px-3.5 py-2.5 text-[15px] outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/15 disabled:opacity-50";

// 버튼 - primary(진한 초록) · ghost(테두리) 두 가지만
export const buttonClass = {
  primary:
    "inline-flex h-11 items-center justify-center gap-2 rounded-[10px] bg-primary px-5 text-[15px] font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60",
  ghost:
    "inline-flex h-11 items-center justify-center gap-2 rounded-[10px] border bg-card px-5 text-[15px] font-medium text-foreground transition-colors hover:bg-secondary disabled:opacity-60",
} as const;

export function Field({
  label,
  htmlFor,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-ink-2">
        {label}
      </label>
      {children}
    </div>
  );
}

export function SubmitButton({
  pending,
  children,
  className,
}: {
  pending: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(buttonClass.primary, "w-full", className)}
    >
      {pending ? "처리 중..." : children}
    </button>
  );
}

export function ErrorText({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}
