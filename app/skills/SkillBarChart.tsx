"use client";

import { useState } from "react";

interface Props {
  data: [string, number][]; // [skill, count], already sorted descending
  jobCount: number;
}

export default function SkillBarChart({ data, jobCount }: Props) {
  const [hovered, setHovered] = useState<string | null>(null);
  const max = data.length ? data[0][1] : 1;

  return (
    <div className="viz-root rounded-lg border p-4" style={{ borderColor: "var(--viz-gridline)" }}>
      <div className="space-y-2">
        {data.map(([skill, count]) => {
          const pct = Math.round((count / jobCount) * 100);
          const widthPct = Math.max((count / max) * 100, 4);
          const isHovered = hovered === skill;
          return (
            <div
              key={skill}
              className="flex items-center gap-3 text-sm"
              onMouseEnter={() => setHovered(skill)}
              onMouseLeave={() => setHovered(null)}
              title={`${skill}: ${count} mention${count === 1 ? "" : "s"} across ${jobCount} job description${jobCount === 1 ? "" : "s"} (${pct}%)`}
            >
              <div
                className="w-40 shrink-0 truncate text-right"
                style={{ color: "var(--viz-text-secondary)" }}
              >
                {skill}
              </div>
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <div
                  className="h-[18px] rounded-r-[4px] transition-opacity"
                  style={{
                    width: `${widthPct}%`,
                    backgroundColor: "var(--viz-series-1)",
                    opacity: isHovered ? 1 : 0.9,
                  }}
                />
                <span
                  className="shrink-0 tabular-nums"
                  style={{ color: "var(--viz-text-primary)" }}
                >
                  {count} ({pct}%)
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
