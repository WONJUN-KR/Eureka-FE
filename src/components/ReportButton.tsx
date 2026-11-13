"use client";

import { AxiosError } from "axios";
import { useEffect, useRef, useState } from "react";

import { useReportPost } from "@/api/mutations";
import { getErrorMessage } from "@/api/request";
import { REPORT_REASONS, type ReportReason } from "@/api/types";
import { buttonClass, ErrorText } from "@/components/ui/field";
import { useDialogFocus } from "@/hooks/useDialogFocus";
import { cn } from "@/lib/utils";

// 글 신고: 버튼 -> 사유 고르는 창. 이 화면에서 신고했거나 이미 신고한 글(409)이면 버튼을 '신고함'으로 잠금
// (BE 에 '내가 신고했는지' 조회가 없어서 새로고침하면 다시 '신고' - 다시 보내면 409 로 같은 안내)
export default function ReportButton({ postId }: { postId: number }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const status = useRef<HTMLParagraphElement>(null);

  // 신고가 끝나면 버튼이 잠겨서 포커스를 받을 수 없음 -> 접수 안내로 옮김
  useEffect(() => {
    if (done) status.current?.focus();
  }, [done]);

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        onClick={() => setOpen(true)}
        disabled={done}
        className={cn(buttonClass.ghost, "h-9 px-3.5 text-sm text-ink-2")}
      >
        {done ? "신고함" : "신고"}
      </button>
      {done && (
        <p
          ref={status}
          tabIndex={-1}
          role="status"
          className="text-right text-sm text-ink-2 outline-none"
        >
          신고가 접수됐어요. 같은 글에 신고가 쌓이면 글이 숨겨져요
        </p>
      )}
      {open && (
        <ReportDialog
          postId={postId}
          onClose={() => setOpen(false)}
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
  // 결과 처리는 mutation 쪽에 둬서, 보내는 중엔 창을 못 닫게 하는 것과 함께 결과가 사라지지 않게
  const report = useReportPost(postId, {
    onSuccess: onDone,
    // 이미 신고한 글(409)도 신고한 상태로 보여줌
    onError: (e) => e instanceof AxiosError && e.response?.status === 409 && onDone(),
  });
  const dialog = useRef<HTMLDivElement>(null);
  // 보내는 중엔 Esc · 바깥 클릭 · 취소로 닫지 않음
  const close = () => !report.isPending && onClose();

  // 라디오 묶음은 Tab 한 번에 하나(고른 것 또는 첫 번째), 마지막은 활성 버튼
  const radios = () => [
    ...(dialog.current?.querySelectorAll<HTMLInputElement>('input[type="radio"]') ?? []),
  ];
  useDialogFocus(dialog, {
    onClose: close,
    initial: () => radios()[0],
    edges: () => {
      const buttons = [
        ...(dialog.current?.querySelectorAll<HTMLButtonElement>("button:not(:disabled)") ?? []),
      ];
      return [radios().find((r) => r.checked) ?? radios()[0], buttons[buttons.length - 1]];
    },
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={close}
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
        <fieldset className="flex flex-col gap-1">
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
          <button
            type="button"
            onClick={close}
            disabled={report.isPending}
            className={cn(buttonClass.ghost, "h-10")}
          >
            취소
          </button>
          <button
            type="button"
            onClick={() => reason && report.mutate(reason)}
            disabled={!reason || report.isPending}
            aria-busy={report.isPending}
            className={cn(buttonClass.primary, "h-10")}
          >
            {report.isPending ? "보내는 중" : "신고하기"}
          </button>
        </div>
      </div>
    </div>
  );
}
