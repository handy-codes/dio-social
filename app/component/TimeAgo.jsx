"use client";

import { useEffect, useState } from "react";

function formatTimeAgo(dateInput) {
  const date = dateInput instanceof Date ? dateInput : new Date(dateInput);
  const diffMs = date.getTime() - Date.now(); // negative => past
  const diffSeconds = Math.round(diffMs / 1000);

  const absSeconds = Math.abs(diffSeconds);
  if (absSeconds < 10) return "just now";

  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  if (absSeconds < 60) return rtf.format(diffSeconds, "second");
  const diffMinutes = Math.round(diffSeconds / 60);
  if (absSeconds < 60 * 60) return rtf.format(diffMinutes, "minute");
  const diffHours = Math.round(diffSeconds / 3600);
  if (absSeconds < 60 * 60 * 24) return rtf.format(diffHours, "hour");
  const diffDays = Math.round(diffSeconds / 86400);
  if (absSeconds < 60 * 60 * 24 * 30) return rtf.format(diffDays, "day");
  const diffMonths = Math.round(diffSeconds / (86400 * 30));
  if (absSeconds < 60 * 60 * 24 * 365) return rtf.format(diffMonths, "month");
  const diffYears = Math.round(diffSeconds / (86400 * 365));
  return rtf.format(diffYears, "year");
}

export default function TimeAgo({ date, className = "" }) {
  // Relative time must not run on the server initial HTML vs first client paint,
  // or hydration mismatches ("just now" vs "13 seconds ago"). Compute only after mount.
  const [value, setValue] = useState(null);

  useEffect(() => {
    setValue(formatTimeAgo(date));
    const interval = setInterval(() => setValue(formatTimeAgo(date)), 30000);
    return () => clearInterval(interval);
  }, [date]);

  return <span className={className}>{value === null ? "…" : value}</span>;
}
