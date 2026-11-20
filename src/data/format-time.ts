export function formatTime(minutes: number) {
  const value = Number.isFinite(minutes) ? Math.max(0, Math.floor(minutes)) : 0;
  if (value < 1) return "только что";
  if (value < 60) return `${value} мин назад`;
  if (value < 1440) return `${Math.floor(value / 60)} ч назад`;
  return `${Math.floor(value / 1440)} дн назад`;
}
