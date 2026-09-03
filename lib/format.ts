/**
 * Indian Rupee (INR - ₹) Formatting Utilities
 * Formats numbers according to Indian numbering system (Lakhs & Crores, e.g. ₹1,25,000)
 */

export function formatINR(amount: number): string {
  const rounded = Math.round(amount || 0);
  const isNegative = rounded < 0;
  const abs = Math.abs(rounded);
  const formatted = abs.toLocaleString('en-IN');
  return isNegative ? `-₹${formatted}` : `₹${formatted}`;
}

export function formatINRDelta(amount: number): string {
  const rounded = Math.round(amount || 0);
  if (rounded === 0) return '₹0';
  const sign = rounded > 0 ? '+₹' : '-₹';
  return `${sign}${Math.abs(rounded).toLocaleString('en-IN')}`;
}
