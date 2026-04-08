/**
 * Finance Utility Functions
 */

/**
 * Format number to Indonesian Rupiah (IDR)
 */
export const formatIDR = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Calculate percentage change between current and previous month values
 */
export const calculateTrend = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

/**
 * Get color for budget progress (accepts percentage)
 */
export const getProgressBarColor = (percentage: number) => {
  if (percentage < 75) return 'bg-emerald-500';
  if (percentage < 100) return 'bg-amber-500';
  return 'bg-red-500';
};

/**
 * Get days remaining until a specific day of the month
 */
export const getDaysRemaining = (dueDay: number) => {
  const today = new Date();
  const currentDay = today.getDate();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  
  if (currentDay <= dueDay) {
    return dueDay - currentDay;
  } else {
    return (daysInMonth - currentDay) + dueDay;
  }
};

/**
 * Parse currency string (e.g., "Rp 1.000.000") to number (1000000)
 */
export const parseCurrency = (value: string): number => {
  return parseInt(value.replace(/[^0-9]/g, '')) || 0;
};

/**
 * Format number to masked currency string (e.g., "1.000.000")
 */
export const formatCurrencyInput = (value: number | string): string => {
  const num = typeof value === 'string' ? parseCurrency(value) : value;
  if (!num) return "";
  return new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(num);
};

/**
 * Format number to IDR for display (Alias for formatIDR)
 */
export const formatCurrency = (amount: number) => formatIDR(amount);

/**
 * Calculate profit and percentage for an investment
 */
export const calculateInvestmentProfit = (inv: { initialAmount: number; currentValue: number }) => {
  const profit = inv.currentValue - inv.initialAmount;
  const percentage = inv.initialAmount > 0 ? (profit / inv.initialAmount) * 100 : 0;
  return { profit, percentage };
};

/**
 * Generate a slug from a string
 */
export const slugify = (text: string) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
};
