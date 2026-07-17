export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 h-9 w-56 animate-pulse rounded-lg bg-line-2" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-card bg-line-2" />
        ))}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <div className="h-64 animate-pulse rounded-card bg-line-2" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-24 animate-pulse rounded-card bg-line-2" />
          ))}
        </div>
      </div>
    </div>
  );
}
