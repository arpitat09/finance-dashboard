import Decimal from 'decimal.js';

Decimal.set({ precision: 20, rounding: Decimal.ROUND_HALF_UP });

export function toDecimal(amount: number | string | Decimal): Decimal {
  return new Decimal(amount);
}

export function formatMoney(amount: number | string | Decimal, currency: string = 'INR'): string {
  const num = new Decimal(amount).toNumber();
  const symbolMap: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };

  const symbol = symbolMap[currency] || '₹';

  if (currency === 'INR') {
    // Indian numbering format (e.g. 2,48,520)
    const formatted = new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(num));
    return `${num < 0 ? '-' : ''}${symbol}${formatted}`;
  }

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(num));
  return `${num < 0 ? '-' : ''}${symbol}${formatted}`;
}

export function roundMoney(amount: number | string | Decimal): number {
  return new Decimal(amount).toDecimalPlaces(2).toNumber();
}
