import React from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';
import { cn } from '../lib/utils';

type InlineNoticeTone = 'success' | 'error' | 'info';

type InlineNoticeProps = {
  title?: string;
  message: string;
  tone?: InlineNoticeTone;
  onClose?: () => void;
  className?: string;
};

const toneStyles: Record<
  InlineNoticeTone,
  {
    wrapper: string;
    icon: string;
  }
> = {
  success: {
    wrapper: 'border-emerald-200 bg-emerald-50 text-emerald-900',
    icon: 'text-emerald-600',
  },
  error: {
    wrapper: 'border-red-200 bg-red-50 text-red-900',
    icon: 'text-red-600',
  },
  info: {
    wrapper: 'border-blue-200 bg-blue-50 text-blue-900',
    icon: 'text-blue-600',
  },
};

const toneIcons = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
} as const;

export default function InlineNotice({
  title,
  message,
  tone = 'info',
  onClose,
  className,
}: InlineNoticeProps) {
  const Icon = toneIcons[tone];

  return (
    <div
      className={cn(
        'rounded-[1.5rem] border px-4 py-4 shadow-sm',
        toneStyles[tone].wrapper,
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <Icon className={cn('mt-0.5 h-5 w-5 shrink-0', toneStyles[tone].icon)} />
        <div className="min-w-0 flex-1">
          {title ? <p className="text-sm font-bold">{title}</p> : null}
          <p className={cn('text-sm leading-relaxed', title ? 'mt-1' : '')}>{message}</p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1 text-current/70 transition-colors hover:bg-white/50 hover:text-current"
            aria-label="Dismiss notice"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
