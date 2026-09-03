export const CATEGORY_COLORS = {
  'Housing & Rent': '#F97316',
  'Housing': '#F97316',
  'Food & Dining': '#FB923C',
  'Food': '#FB923C',
  'Transportation': '#38BDF8',
  'Utilities & Bills': '#FBBF24',
  'Utilities': '#FBBF24',
  'Shopping & Groceries': '#EC4899',
  'Shopping': '#EC4899',
  'Healthcare & Medical': '#EF4444',
  'Healthcare': '#EF4444',
  'Education & Courses': '#6366F1',
  'Education': '#6366F1',
  'Entertainment & Leisure': '#A855F7',
  'Entertainment': '#A855F7',
  'Subscriptions': '#14B8A6',
  'Travel & Vacation': '#0EA5E9',
  'Salary': '#10B981',
  'Freelance & Consulting': '#06B6D4',
  'Freelance': '#06B6D4',
  'Investments & Dividends': '#F59E0B',
  'Investment': '#F59E0B',
  'Other Income': '#8B5CF6',
  'Other Expenses': '#9CA3AF',
  'Other': '#9CA3AF',
};

export const INCOME_CATEGORIES = [
  'Salary',
  'Freelance & Consulting',
  'Investments & Dividends',
  'Other Income',
];

export const EXPENSE_CATEGORIES = [
  'Housing & Rent',
  'Food & Dining',
  'Transportation',
  'Utilities & Bills',
  'Shopping & Groceries',
  'Healthcare & Medical',
  'Education & Courses',
  'Entertainment & Leisure',
  'Subscriptions',
  'Travel & Vacation',
  'Other Expenses',
];

export const formatMoney = (amount, currency = 'INR') => {
  const num = typeof amount === 'number' ? amount : parseFloat(amount) || 0;
  const isNegative = num < 0;
  const absNum = Math.abs(num);

  const symbolMap = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
  };

  const symbol = symbolMap[currency] || '₹';

  if (currency === 'INR') {
    // Indian formatting (e.g. 2,48,520)
    const parts = absNum.toFixed(2).split('.');
    let integerPart = parts[0];
    const decimalPart = parts[1];

    if (integerPart.length > 3) {
      const lastThree = integerPart.substring(integerPart.length - 3);
      const otherNumbers = integerPart.substring(0, integerPart.length - 3);
      integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
    }

    return `${isNegative ? '-' : ''}${symbol}${integerPart}.${decimalPart}`;
  }

  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(absNum);

  return `${isNegative ? '-' : ''}${symbol}${formatted}`;
};

export const fmt = (amount, currency = 'INR') => formatMoney(amount, currency);

export const fmtDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const fmtDateTime = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const fmtMonth = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
};

export const hexToRgb = (hex) => {
  if (!hex) return '249, 115, 22';
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  const r = parseInt(hex.substring(0, 2), 16) || 249;
  const g = parseInt(hex.substring(2, 4), 16) || 115;
  const b = parseInt(hex.substring(4, 6), 16) || 22;
  return `${r}, ${g}, ${b}`;
};

export const exportToCSV = (filename, rows) => {
  const processRow = (row) =>
    row
      .map((val) => {
        let text = val === null || val === undefined ? '' : String(val);
        text = text.replace(/"/g, '""');
        return `"${text}"`;
      })
      .join(',');

  const csvFile = rows.map(processRow).join('\n');
  const blob = new Blob([csvFile], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
};

export const exportToJSON = (filename, data) => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};