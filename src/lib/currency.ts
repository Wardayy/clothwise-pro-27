export function formatPKR(amount: number): string {
  return `Rs ${amount.toLocaleString('en-PK')}`;
}

export function parsePKR(value: string): number {
  return Number(value.replace(/[^0-9.-]/g, ''));
}
