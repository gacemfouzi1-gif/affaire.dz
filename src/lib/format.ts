export function formatCurrency(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "0 DA";
  }
  return `${Math.round(amount).toLocaleString()} DA`;
}
