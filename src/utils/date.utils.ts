export function parseDDMMYYYY(dateStr: string): Date | null {
  if (!dateStr) return null;

  const [day, month, year] = dateStr.split("-").map(Number);

  const date = new Date(year, month - 1, day);

  return isNaN(date.getTime()) ? null : date;
}