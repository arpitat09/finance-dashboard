export const CATEGORY_COLORS = {
  'Housing': '#E8B931', 'Food & Dining': '#F97316', 'Transportation': '#06B6D4',
  'Entertainment': '#A855F7', 'Shopping': '#EC4899', 'Utilities': '#14B8A6',
  'Healthcare': '#EF4444', 'Education': '#6366F1', 'Salary': '#34D399',
  'Freelance': '#22D3EE', 'Investment': '#FBBF24', 'Other': '#9CA3AF'
};

export const INCOME_CATEGORIES = ['Salary', 'Freelance', 'Investment', 'Other'];
export const EXPENSE_CATEGORIES = ['Housing', 'Food & Dining', 'Transportation', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Education', 'Other'];

export const fmt = (amount) => '$' + Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const fmtDate = (dateStr) => new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
export const fmtMonth = (dateStr) => new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
export const hexToRgb = (hex) => { hex = hex.replace('#', ''); return `${parseInt(hex.substring(0,2),16)},${parseInt(hex.substring(2,4),16)},${parseInt(hex.substring(4,6),16)}`; };