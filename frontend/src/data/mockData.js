// Generates a date string that is `days` in the past from today
function daysAgo(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

export const defaultTransactions = [
  // --- Month 1 (60-90 days ago) ---
  { id: 1,  date: daysAgo(89), description: 'Monthly Salary',        amount: 5200,   category: 'Salary',          type: 'income' },
  { id: 2,  date: daysAgo(88), description: 'Rent Payment',           amount: 1400,   category: 'Housing',         type: 'expense' },
  { id: 3,  date: daysAgo(85), description: 'Grocery Store',          amount: 87.50,  category: 'Food & Dining',   type: 'expense' },
  { id: 4,  date: daysAgo(83), description: 'Electric Bill',          amount: 95,     category: 'Utilities',       type: 'expense' },
  { id: 5,  date: daysAgo(80), description: 'Uber Rides',             amount: 42.30,  category: 'Transportation',  type: 'expense' },
  { id: 6,  date: daysAgo(78), description: 'Netflix Subscription',   amount: 15.99,  category: 'Entertainment',   type: 'expense' },
  { id: 7,  date: daysAgo(76), description: 'New Running Shoes',      amount: 129.99, category: 'Shopping',        type: 'expense' },
  { id: 8,  date: daysAgo(74), description: 'Dinner with Friends',    amount: 65,     category: 'Food & Dining',   type: 'expense' },
  { id: 9,  date: daysAgo(72), description: 'Internet Bill',          amount: 59.99,  category: 'Utilities',       type: 'expense' },
  { id: 10, date: daysAgo(70), description: 'Dentist Visit',          amount: 180,    category: 'Healthcare',      type: 'expense' },
  { id: 11, date: daysAgo(68), description: 'Online Course',          amount: 49.99,  category: 'Education',       type: 'expense' },
  { id: 12, date: daysAgo(65), description: 'Coffee Shop',            amount: 28.50,  category: 'Food & Dining',   type: 'expense' },
  { id: 13, date: daysAgo(62), description: 'Freelance Payment',      amount: 800,    category: 'Freelance',       type: 'income' },

  // --- Month 2 (30-60 days ago) ---
  { id: 14, date: daysAgo(58), description: 'Monthly Salary',         amount: 5200,   category: 'Salary',          type: 'income' },
  { id: 15, date: daysAgo(57), description: 'Rent Payment',           amount: 1400,   category: 'Housing',         type: 'expense' },
  { id: 16, date: daysAgo(55), description: 'Supermarket',            amount: 102.30, category: 'Food & Dining',   type: 'expense' },
  { id: 17, date: daysAgo(53), description: 'Gas Station',            amount: 55,     category: 'Transportation',  type: 'expense' },
  { id: 18, date: daysAgo(51), description: 'Spotify Premium',        amount: 9.99,   category: 'Entertainment',   type: 'expense' },
  { id: 19, date: daysAgo(49), description: 'Gym Membership',         amount: 45,     category: 'Healthcare',      type: 'expense' },
  { id: 20, date: daysAgo(47), description: 'Winter Jacket',          amount: 189.99, category: 'Shopping',        type: 'expense' },
  { id: 21, date: daysAgo(45), description: 'Valentine Dinner',       amount: 95,     category: 'Food & Dining',   type: 'expense' },
  { id: 22, date: daysAgo(43), description: 'Phone Bill',             amount: 35,     category: 'Utilities',       type: 'expense' },
  { id: 23, date: daysAgo(41), description: 'Electric Bill',          amount: 88,     category: 'Utilities',       type: 'expense' },
  { id: 24, date: daysAgo(39), description: 'Book Purchase',          amount: 24.99,  category: 'Education',       type: 'expense' },
  { id: 25, date: daysAgo(37), description: 'Side Project Income',    amount: 350,    category: 'Freelance',       type: 'income' },
  { id: 26, date: daysAgo(34), description: 'Takeout Food',           amount: 38.50,  category: 'Food & Dining',   type: 'expense' },
  { id: 27, date: daysAgo(31), description: 'Parking Fee',            amount: 15,     category: 'Transportation',  type: 'expense' },

  // --- Month 3 (0-30 days ago) ---
  { id: 28, date: daysAgo(28), description: 'Monthly Salary',         amount: 5200,   category: 'Salary',          type: 'income' },
  { id: 29, date: daysAgo(27), description: 'Rent Payment',           amount: 1400,   category: 'Housing',         type: 'expense' },
  { id: 30, date: daysAgo(25), description: 'Weekly Groceries',       amount: 95.20,  category: 'Food & Dining',   type: 'expense' },
  { id: 31, date: daysAgo(23), description: 'Subway Pass',            amount: 127,    category: 'Transportation',  type: 'expense' },
  { id: 32, date: daysAgo(21), description: 'Movie Tickets',          amount: 32,     category: 'Entertainment',   type: 'expense' },
  { id: 33, date: daysAgo(19), description: 'Pharmacy',               amount: 45.60,  category: 'Healthcare',      type: 'expense' },
  { id: 34, date: daysAgo(17), description: 'Electronics Store',      amount: 249.99, category: 'Shopping',        type: 'expense' },
  { id: 35, date: daysAgo(15), description: 'Lunch Meeting',          amount: 42,     category: 'Food & Dining',   type: 'expense' },
  { id: 36, date: daysAgo(13), description: 'Water Bill',             amount: 32,     category: 'Utilities',       type: 'expense' },
  { id: 37, date: daysAgo(11), description: 'Online Workshop',        amount: 79.99,  category: 'Education',       type: 'expense' },
  { id: 38, date: daysAgo(9),  description: 'Freelance Payment',      amount: 600,    category: 'Freelance',       type: 'income' },
  { id: 39, date: daysAgo(7),  description: 'Grocery Haul',           amount: 110.40, category: 'Food & Dining',   type: 'expense' },
  { id: 40, date: daysAgo(4),  description: 'Concert Tickets',        amount: 75,     category: 'Entertainment',   type: 'expense' },
  { id: 41, date: daysAgo(1),  description: 'Car Insurance',          amount: 165,    category: 'Transportation',  type: 'expense' },
];