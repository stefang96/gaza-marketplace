import { escrowSteps } from "@/lib/booking";
import type { BookingStatus, EscrowState } from "@/lib/types";

// The escrow stepper is one of the two most important visual elements (spec §8).
export function EscrowStepper({
  status,
  escrowState,
  orientation = "horizontal",
}: {
  status: BookingStatus;
  escrowState: EscrowState;
  orientation?: "horizontal" | "vertical";
}) {
  const steps = escrowSteps({ status, escrowState });

  if (orientation === "vertical") {
    return (
      <ol className="space-y-4">
        {steps.map((s) => (
          <li key={s.key} className="flex items-start gap-3">
            <Dot state={s.state} />
            <div>
              <div
                className={`text-sm font-semibold ${
                  s.state === "todo" ? "text-muted" : "text-ink"
                }`}
              >
                {s.label}
              </div>
              <StateLabel state={s.state} />
            </div>
          </li>
        ))}
      </ol>
    );
  }

  return (
    <ol className="flex items-center gap-2">
      {steps.map((s, i) => (
        <li key={s.key} className="flex flex-1 items-center gap-2">
          <div className="flex items-center gap-2">
            <Dot state={s.state} />
            <span
              className={`hidden text-sm font-medium sm:inline ${
                s.state === "todo" ? "text-muted" : "text-ink"
              }`}
            >
              {s.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <span
              className={`h-0.5 flex-1 rounded ${
                s.state === "done" ? "bg-green" : "bg-line-2"
              }`}
            />
          )}
        </li>
      ))}
    </ol>
  );
}

function Dot({ state }: { state: "done" | "active" | "todo" | "cancelled" }) {
  const cls =
    state === "done"
      ? "bg-green text-white"
      : state === "active"
        ? "bg-accent text-white"
        : state === "cancelled"
          ? "bg-surface-2 text-muted line-through"
          : "bg-surface-2 text-muted border border-line-2";
  return (
    <span
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${cls}`}
    >
      {state === "done" ? "✓" : state === "cancelled" ? "×" : ""}
    </span>
  );
}

function StateLabel({ state }: { state: string }) {
  const map: Record<string, { text: string; cls: string }> = {
    done: { text: "Završeno", cls: "text-green" },
    active: { text: "U toku", cls: "text-accent" },
    todo: { text: "Čeka", cls: "text-muted" },
    cancelled: { text: "Otkazano", cls: "text-muted" },
  };
  const m = map[state];
  return <div className={`text-xs ${m.cls}`}>{m.text}</div>;
}
