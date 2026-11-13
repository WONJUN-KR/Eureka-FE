"use client";

import { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";

import { useReportPost } from "@/api/mutations";
import { getErrorMessage } from "@/api/request";
import { REPORT_REASONS, type ReportReason } from "@/api/types";
import { buttonClass, ErrorText } from "@/components/ui/field";
import { cn } from "@/lib/utils";

// 글 신고: 버튼 -> 사유 고르는 창. 신고했거나 이미 신고한 글이면 버튼을 '신고함'으로 잠금
export default function ReportButton({ postId }: { postId: number }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        ref={opener}
        type="button"
        onClick={() => setOpen(true)}
        disabled={done}
        className={cn(buttonClass.ghost, "h-9 px-3.5 text-sm text-ink-2")}
      >
        {done ? "신고함" : "신고"}
      </button>
      {done && (
        <p role="status" className="text-right text-sm text-ink-2">
          신고가 접수됐어요. 같은 글에 신고가 쌓이면 글이 숨겨져요
        </p>
      )}
      {open && (
        <ReportDialog
          postId={postId}
          onClose={() => {
            setOpen(false);
            opener.current?.focus();
          }}
          onDone={() => {
            setOpen(false);
            setDone(true);
          }}
        />
      )}
    </div>
  );
}

function ReportDialog({
  postId,
  onClose,
  onDone,
}: {
  postId: number;
  onClose: () => void;
  onDone: () => void;
}) {
  const [reason, setReason] = useState<ReportReason>();
  const report = useReportPost(postId);
  const dialog = useRef<HTMLDivElement>(null);

  // 열면 첫 사유로 포커스, Esc 로 닫기, Tab 은 창 안에서만
  useEffect(() => {
    dialog.current?.querySelector<HTMLInputElement>("input")?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key !== "Tab" || !dialog.current) return;
      // 라디오 묶음은 Tab 한 번에 하나(고른 것 또는 첫 번째), 마지막은 활성 버튼
      const radios = [...dialog.current.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
      const buttons = [
        ...dialog.current.querySelectorAll<HTMLButtonElement>("button:not(:disabled)"),
      ];
      const first = radios.find((r) => r.checked) ?? radios[0];
      const last = buttons[buttons.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = () => {
    if (!reason) return;
    report.mutate(reason, {
      onSuccess: onDone,
      // 이미 신고한 글(409)도 신고한 상태로 보여줌
      onError: (e) => e instanceof AxiosError && e.response?.status === 409 && onDone(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        ref={dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
        className="w-full max-w-sm rounded-2xl border bg-card p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="report-title" className="mb-1 text-lg font-medium">
          이 글 신고
        </h2>
        <p className="mb-5 text-sm text-ink-2">신고 이유를 골라 주세요</p>
        <fieldset className="flex flex-col gap-1" disabled={report.isPending}>
          <legend className="sr-only">신고 이유</legend>
          {REPORT_REASONS.map((r) => (
            <label
              key={r.value}
              className="flex h-10 cursor-pointer items-center gap-3 rounded-lg px-2 text-[15px] hover:bg-secondary"
            >
              <input
                type="radio"
                name="reason"
                value={r.value}
                checked={reason === r.value}
                onChange={() => setReason(r.value)}
                className="size-4 accent-primary"
              />
              {r.label}
            </label>
          ))}
        </fieldset>
        <ErrorText message={report.isError ? getErrorMessage(report.error) : null} />
        <div className="mt-6 flex justify-end gap-2">
          <button type="button" onClick={onClose} className={cn(buttonClass.ghost, "h-10")}>
            취소
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!reason || report.isPending}
            className={cn(buttonClass.primary, "h-10")}
          >
            {report.isPending ? "보내는 중" : "신고하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
