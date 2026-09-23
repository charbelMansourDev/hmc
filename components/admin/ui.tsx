// Small presentational building blocks for the CMS (Tailwind utilities on brand tokens).

export const inputClass =
  "block w-full rounded-sm border border-line bg-white px-3.5 py-2.5 text-sm text-ink shadow-sm " +
  "placeholder:text-muted/60 focus:border-teal focus:outline-none focus:ring-4 focus:ring-teal/15 " +
  "aria-[invalid=true]:border-danger aria-[invalid=true]:ring-4 aria-[invalid=true]:ring-danger/10";

export const buttonClass = {
  primary:
    "inline-flex items-center justify-center gap-2 rounded-pill bg-teal px-5 py-2.5 text-sm font-semibold text-white " +
    "shadow-sm transition hover:bg-teal-hover disabled:cursor-progress disabled:opacity-60",
  secondary:
    "inline-flex items-center justify-center gap-2 rounded-pill border border-line bg-white px-5 py-2.5 text-sm " +
    "font-semibold text-ink-2 shadow-sm transition hover:bg-bg-soft disabled:opacity-60",
  danger:
    "inline-flex items-center justify-center gap-2 rounded-pill border border-danger/30 bg-white px-5 py-2.5 " +
    "text-sm font-semibold text-danger transition hover:bg-danger-soft disabled:opacity-60",
};

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-3xl text-ink">{title}</h1>
        {description ? <p className="mt-1.5 max-w-2xl text-sm text-muted">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-lg border border-white bg-white/90 p-6 shadow-md ${className}`}>{children}</div>;
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: React.ReactNode;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs font-medium text-danger" id={`${htmlFor}-error`}>
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Notice({ tone, children }: { tone: "error" | "success" | "info"; children: React.ReactNode }) {
  const styles = {
    error: "border-danger/20 bg-danger-soft text-danger",
    success: "border-teal/20 bg-teal-soft text-teal-hover",
    info: "border-line bg-bg-soft text-ink-2",
  }[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={`rounded-sm border px-4 py-3 text-sm ${styles}`}>
      {children}
    </div>
  );
}

export function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="rounded-md border border-dashed border-line bg-white/60 px-6 py-10 text-center text-sm text-muted">{children}</p>;
}
