export function StatCardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-3 w-24 bg-[var(--bg-surface)] rounded-md mb-3" />
      <div className="h-7 w-36 bg-[var(--bg-surface)] rounded-lg mb-2" />
      <div className="h-3 w-28 bg-[var(--bg-surface)] rounded-md" />
    </div>
  );
}

export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="flex flex-col gap-2.5 animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-14 w-full bg-[var(--bg-secondary)] border rounded-xl p-3 flex items-center justify-between"
          style={{ borderColor: 'var(--border)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface)]" />
            <div className="flex flex-col gap-1.5">
              <div className="h-3.5 w-32 bg-[var(--bg-surface)] rounded-md" />
              <div className="h-2.5 w-20 bg-[var(--bg-surface)] rounded-md" />
            </div>
          </div>
          <div className="h-4 w-20 bg-[var(--bg-surface)] rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="card h-64 flex flex-col justify-between animate-pulse">
      <div className="h-4 w-32 bg-[var(--bg-surface)] rounded-md" />
      <div className="h-44 w-full bg-[var(--bg-surface)] rounded-xl" />
    </div>
  );
}
