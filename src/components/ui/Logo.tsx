import { useId } from "react";

import { cn } from "@/lib/utils";

// 로고: 필름 카메라 정면 + 플래시 빛 세 줄 (셔터 누르는 '유레카!' 순간)
// 카메라 몸체는 글자색(currentColor), 렌즈 · 창 · 띠는 마스크로 뚫어서 어떤 배경 위에서도 그대로 보임
export function LogoMark({ className }: { className?: string }) {
  const id = useId();
  const mask = `logo-mask-${id}`;
  return (
    <svg viewBox="170 120 740 640" className={className} aria-hidden>
      <defs>
        <mask id={mask} maskUnits="userSpaceOnUse" x="170" y="120" width="740" height="640">
          <rect x="170" y="120" width="740" height="640" fill="#fff" />
          <rect x="697" y="342" width="90" height="46" rx="6" fill="#000" />
          <rect x="170" y="410" width="740" height="18" fill="#000" />
          <circle cx="515" cy="538" r="192" fill="#fff" />
          <circle cx="515" cy="538" r="176" fill="#000" />
          <circle cx="515" cy="538" r="159" fill="#fff" />
          <circle cx="515" cy="538" r="140" fill="#000" />
          <circle cx="515" cy="538" r="118" fill="#fff" />
          <path d="M445 538 A70 70 0 0 1 515 468" fill="none" stroke="#000" strokeWidth="16" />
        </mask>
      </defs>
      <g fill="currentColor" mask={`url(#${mask})`}>
        <rect x="182" y="318" width="660" height="427" rx="24" />
        <rect x="234" y="284" width="88" height="44" rx="8" />
        <rect x="697" y="283" width="88" height="40" rx="8" />
        <path d="M400 320 L428 266 Q433 257 443 257 L577 257 Q587 257 592 266 L625 320 Z" />
      </g>
      <g className="fill-trail">
        <path d="M708 134 L741 131 L738 241 Z" />
        <path d="M815 138 L844 155 L778 243 Z" />
        <path d="M885 213 L902 240 L800 272 Z" />
      </g>
    </svg>
  );
}

// 로고 + '유레카' 글자
export default function Logo({ className }: { className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-serif tracking-tight", className)}>
      <LogoMark className="h-[1.1em] w-auto" />
      유레카
    </span>
  );
}
