export function formatLapTime(seconds: number | null): string | null {
  if (seconds === null || !Number.isFinite(seconds)) return null;

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds - minutes * 60;

  return `${minutes}:${remainingSeconds.toFixed(3).padStart(6, '0')}`;
}

export function formatGap(seconds: number | null): string | null {
  if (seconds === null || !Number.isFinite(seconds)) return null;

  return `+${seconds.toFixed(3)}s`;
}
