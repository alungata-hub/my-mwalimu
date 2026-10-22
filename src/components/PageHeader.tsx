import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
}

export function PageHeader({ title, subtitle, eyebrow, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-6 lg:mb-8">
      <div>
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-wider text-primary-600 mb-1.5">
            {eyebrow}
          </p>
        )}
        <h1 className="text-2xl sm:text-3xl font-bold text-ink-900">{title}</h1>
        {subtitle && (
          <p className="mt-1.5 text-sm sm:text-base text-ink-500 max-w-2xl">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
