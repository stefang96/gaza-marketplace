export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-6 h-9 w-48 animate-pulse rounded-lg bg-line-2" />
      <div className="h-28 animate-pulse rounded-card bg-line-2" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-56 animate-pulse rounded-card bg-line-2" />
        ))}
      </div>
    </div>
  );
}
