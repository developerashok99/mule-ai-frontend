"use client";

import { useState } from "react";

export default function JobsTrendChart({ data }: { data: [string, number][] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const max = Math.max(...data.map(([, n]) => n), 1);

  if (data.length < 3) {
    return (
      <div className="viz-root rounded-lg border p-4 text-sm" style={{ borderColor: "var(--viz-gridline)", color: "var(--viz-text-secondary)" }}>
        Not enough history yet to show a trend — check back after a few more days of the pipeline running.
      </div>
    );
  }

  return (
    <div className="viz-root rounded-lg border p-4" style={{ borderColor: "var(--viz-gridline)" }}>
      <div className="flex items-end gap-1.5 h-32">
        {data.map(([date, count]) => {
          const heightPct = Math.max((count / max) * 100, 4);
          const isHovered = hovered === date;
          return (
            <div
              key={date}
              className="flex-1 flex flex-col items-center justify-end h-full group"
              onMouseEnter={() => setHovered(date)}
              onMouseLeave={() => setHovered(null)}
              title={`${date}: ${count} new posting${count === 1 ? "" : "s"}`}
            >
              <span
                className="text-xs tabular-nums mb-1"
                style={{ color: "var(--viz-text-primary)", opacity: isHovered ? 1 : 0 }}
              >
                {count}
              </span>
              <div
                className="w-full rounded-t-[4px] transition-opacity"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: "var(--viz-series-1)",
                  opacity: isHovered ? 1 : 0.85,
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex gap-1.5 mt-1">
        {data.map(([date]) => (
          <div key={date} className="flex-1 text-center text-[10px]" style={{ color: "var(--viz-muted)" }}>
            {date.slice(5)}
          </div>
        ))}
      </div>
    </div>
  );
}
