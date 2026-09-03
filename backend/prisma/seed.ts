import dotenv from 'dotenv';
dotenv.config();

import { PrismaClient, TransactionType, AccountType, BudgetPeriod, GoalStatus, Frequency, PaymentMethod } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(12, 0, 0, 0);
  return d;
}

export async function seed() {
  console.log('🌱 Starting FINORA Database Seeding...');

  // Clean existing demo data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.recurringTransaction.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.account.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Demo@12345', 10);
  const alicePasswordHash = await bcrypt.hash('Alice@12345', 10);

  // 1. Create Primary Demo User
  const demoUser = await prisma.user.create({
    data: {
      name: 'Arpita',
      email: 'demo@finora.app',
      passwordHash,
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      role: 'ADMIN',
    },
  });

  // Create Secondary Test User for Ownership Isolation
  const aliceUser = await prisma.user.create({
    data: {
      name: 'Alice',
      email: 'alice@finora.app',
      passwordHash: alicePasswordHash,
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      role: 'USER',
    },
  });

  console.log(`👤 Created users: ${demoUser.email} & ${aliceUser.email}`);

  // 2. Create Accounts for Demo User
  const hdfc = await prisma.account.create({
    data: { userId: demoUser.id, name: 'HDFC Salary Account', type: AccountType.BANK, balance: '148500.00', currency: 'INR' },
  });
  const icici = await prisma.account.create({
    data: { userId: demoUser.id, name: 'ICICI Emergency Savings', type: AccountType.SAVINGS, balance: '80000.00', currency: 'INR' },
  });
  const zerodha = await prisma.account.create({
    data: { userId: demoUser.id, name: 'Zerodha Demat Portfolio', type: AccountType.INVESTMENT, balance: '215000.00', currency: 'INR' },
  });
  const wallet = await prisma.account.create({
    data: { userId: demoUser.id, name: 'PayTM / Cash Wallet', type: AccountType.WALLET, balance: '8450.00', currency: 'INR' },
  });

  // Accounts for Alice
  await prisma.account.create({
    data: { userId: aliceUser.id, name: "Alice's Bank", type: AccountType.BANK, balance: '50000.00', currency: 'INR' },
  });

  console.log('💳 Created financial accounts');

  // 3. Create Categories for Demo User
  const categoryDefs = [
    { name: 'Salary', type: TransactionType.INCOME, icon: 'Briefcase', color: '#10B981' },
    { name: 'Freelance & Consulting', type: TransactionType.INCOME, icon: 'Laptop', color: '#06B6D4' },
    { name: 'Investments & Dividends', type: TransactionType.INCOME, icon: 'TrendingUp', color: '#F59E0B' },
    { name: 'Other Income', type: TransactionType.INCOME, icon: 'PlusCircle', color: '#8B5CF6' },

    { name: 'Housing & Rent', type: TransactionType.EXPENSE, icon: 'Home', color: '#F97316' },
    { name: 'Food & Dining', type: TransactionType.EXPENSE, icon: 'Utensils', color: '#FB923C' },
    { name: 'Transportation', type: TransactionType.EXPENSE, icon: 'Car', color: '#38BDF8' },
    { name: 'Utilities & Bills', type: TransactionType.EXPENSE, icon: 'Zap', color: '#FBBF24' },
    { name: 'Shopping & Groceries', type: TransactionType.EXPENSE, icon: 'ShoppingBag', color: '#EC4899' },
    { name: 'Healthcare & Medical', type: TransactionType.EXPENSE, icon: 'HeartPulse', color: '#EF4444' },
    { name: 'Education & Courses', type: TransactionType.EXPENSE, icon: 'GraduationCap', color: '#6366F1' },
    { name: 'Entertainment & Leisure', type: TransactionType.EXPENSE, icon: 'Film', color: '#A855F7' },
    { name: 'Subscriptions', type: TransactionType.EXPENSE, icon: 'Repeat', color: '#14B8A6' },
    { name: 'Travel & Vacation', type: TransactionType.EXPENSE, icon: 'Plane', color: '#0EA5E9' },
    { name: 'Other Expenses', type: TransactionType.EXPENSE, icon: 'CircleDot', color: '#9CA3AF' },
  ];

  const catMap: Record<string, string> = {};
  for (const c of categoryDefs) {
    const created = await prisma.category.create({
      data: {
        userId: demoUser.id,
        name: c.name,
        type: c.type,
        icon: c.icon,
        color: c.color,
        isDefault: true,
      },
    });
    catMap[c.name] = created.id;

    // Also give Alice default categories
    await prisma.category.create({
      data: {
        userId: aliceUser.id,
        name: c.name,
        type: c.type,
        icon: c.icon,
        color: c.color,
        isDefault: true,
      },
    });
  }

  console.log('🏷️ Created categories');

  // 4. Create Budgets
  await prisma.budget.createMany({
    data: [
      { userId: demoUser.id, categoryId: catMap['Housing & Rent'], name: 'Monthly Rent Cap', amount: '20000.00', period: BudgetPeriod.MONTHLY },
      { userId: demoUser.id, categoryId: catMap['Food & Dining'], name: 'Food & Dining Limit', amount: '12000.00', period: BudgetPeriod.MONTHLY },
      { userId: demoUser.id, categoryId: catMap['Shopping & Groceries'], name: 'Shopping Budget', amount: '10000.00', period: BudgetPeriod.MONTHLY },
      { userId: demoUser.id, categoryId: catMap['Transportation'], name: 'Fuel & Commute', amount: '6000.00', period: BudgetPeriod.MONTHLY },
      { userId: demoUser.id, categoryId: catMap['Entertainment & Leisure'], name: 'Movies & Outings', amount: '4000.00', period: BudgetPeriod.MONTHLY },
    ],
  });

  console.log('📊 Created budgets');

  // 5. Create Savings Goals
  await prisma.goal.createMany({
    data: [
      {
        userId: demoUser.id,
        name: 'Emergency Fund',
        targetAmount: '200000.00',
        currentAmount: '145000.00',
        deadline: new Date('2026-12-31'),
        color: '#22C55E',
        icon: 'ShieldCheck',
        status: GoalStatus.IN_PROGRESS,
      },
      {
        userId: demoUser.id,
        name: 'MacBook Pro M3 Max',
        targetAmount: '150000.00',
        currentAmount: '95000.00',
        deadline: new Date('2026-10-15'),
        color: '#F97316',
        icon: 'Laptop',
        status: GoalStatus.IN_PROGRESS,
      },
      {
        userId: demoUser.id,
        name: 'Japan Autumn Vacation',
        targetAmount: '120000.00',
        currentAmount: '54000.00',
        deadline: new Date('2026-11-20'),
        color: '#06B6D4',
        icon: 'Plane',
        status: GoalStatus.IN_PROGRESS,
      },
    ],
  });

  console.log('🎯 Created goals');

  // 6. Create Recurring Payments
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  nextMonth.setDate(5);

  await prisma.recurringTransaction.createMany({
    data: [
      {
        userId: demoUser.id,
        accountId: hdfc.id,
        categoryId: catMap['Housing & Rent'],
        description: 'Apartment Monthly Rent',
        amount: '18000.00',
        type: TransactionType.EXPENSE,
        frequency: Frequency.MONTHLY,
        nextDate: nextMonth,
        startDate: new Date('2026-01-01'),
        isActive: true,
      },
      {
        userId: demoUser.id,
        accountId: hdfc.id,
        categoryId: catMap['Subscriptions'],
        description: 'Netflix Premium 4K',
        amount: '649.00',
        type: TransactionType.EXPENSE,
        frequency: Frequency.MONTHLY,
        nextDate: daysAgo(-3),
        startDate: new Date('2026-01-01'),
        isActive: true,
      },
      {
        userId: demoUser.id,
        accountId: wallet.id,
        categoryId: catMap['Subscriptions'],
        description: 'Spotify Premium Family',
        amount: '179.00',
        type: TransactionType.EXPENSE,
        frequency: Frequency.MONTHLY,
        nextDate: daysAgo(-6),
        startDate: new Date('2026-01-01'),
        isActive: true,
      },
      {
        userId: demoUser.id,
        accountId: hdfc.id,
        categoryId: catMap['Utilities & Bills'],
        description: 'Airtel Xstream Fiber Internet',
        amount: '999.00',
        type: TransactionType.EXPENSE,
        frequency: Frequency.MONTHLY,
        nextDate: daysAgo(-8),
        startDate: new Date('2026-01-01'),
        isActive: true,
      },
      {
        userId: demoUser.id,
        accountId: hdfc.id,
        categoryId: catMap['Salary'],
        description: 'Monthly Senior Tech Salary',
        amount: '85000.00',
        type: TransactionType.INCOME,
        frequency: Frequency.MONTHLY,
        nextDate: daysAgo(-28),
        startDate: new Date('2026-01-01'),
        isActive: true,
      },
    ],
  });

  console.log('🔄 Created recurring transactions');

  // 7. Seed 45+ Realistic Transactions across 3 Months
  const txs = [
    // Month 1 (60-90 days ago)
    { date: daysAgo(88), desc: 'TechCorp Monthly Salary', amt: 85000, cat: 'Salary', type: TransactionType.INCOME, acc: hdfc.id, method: PaymentMethod.TRANSFER },
    { date: daysAgo(87), desc: 'Apartment Rent Transfer', amt: 18000, cat: 'Housing & Rent', type: TransactionType.EXPENSE, acc: hdfc.id, method: PaymentMethod.NET_BANKING },
    { date: daysAgo(85), desc: 'Nature Basket Supermarket', amt: 3450, cat: 'Shopping & Groceries', type: TransactionType.EXPENSE, acc: hdfc.id, method: PaymentMethod.CARD },
    { date: daysAgo(83), desc: 'BESCOM Electricity Bill', amt: 1420, cat: 'Utilities & Bills', type: TransactionType.EXPENSE, acc: wallet.id, method: PaymentMethod.UPI },
    { date: daysAgo(81), desc: 'Freelance UI/UX Dashboard Project', amt: 25000, cat: 'Freelance & Consulting', type: TransactionType.INCOME, acc: hdfc.id, method: PaymentMethod.TRANSFER },
    { date: daysAgo(79), desc: 'Uber Office Commutes', amt: 1250, cat: 'Transportation', type: TransactionType.EXPENSE, acc: wallet.id, method: PaymentMethod.UPI },
    { date: daysAgo(76), desc: 'Dinner at Burma Burma', amt: 2840, cat: 'Food & Dining', type: TransactionType.EXPENSE, acc: hdfc.id, method: PaymentMethod.CARD },
    { date: daysAgo(74), desc: 'Airtel Broadband Recharge', amt: 999, cat: 'Utilities & Bills', type: TransactionType.EXPENSE, acc: wallet.id, method: PaymentMethod.UPI },
    { date: daysAgo(72), desc: 'SIP Mutual Fund Investment (Nifty 50)', amt: 15000, cat: 'Investments & Dividends', type: TransactionType.EXPENSE, acc: zerodha.id, method: PaymentMethod.NET_BANKING },
    { date: daysAgo(68), desc: 'Zomato Weekend Food Orders', amt: 1680, cat: 'Food & Dining', type: TransactionType.EXPENSE, acc: wallet.id, method: PaymentMethod.UPI },
    { date: daysAgo(65), desc: 'Dentist Checkup & Cleaning', amt: 2500, cat: 'Healthcare & Medical', type: TransactionType.EXPENSE, acc: hdfc.id, method: PaymentMethod.UPI },
    { date: daysAgo(62), desc: 'Zara Weekend Shopping', amt: 4990, cat: 'Shopping & Groceries', type: TransactionType.EXPENSE, acc: hdfc.id, method: PaymentMethod.CARD },

    // Month 2 (30-60 days ago)
    { date: daysAgo(58), desc: 'TechCorp Monthly Salary', amt: 85000, cat: 'Salary', type: TransactionType.INCOME, acc: hdfc.id, method: PaymentMethod.TRANSFER },
    { date: daysAgo(57), desc: 'Apartment Rent Transfer', amt: 18000, cat: 'Housing & Rent', type: TransactionType.EXPENSE, acc: hdfc.id, method: PaymentMethod.NET_BANKING },
    { date: daysAgo(55), desc: 'Blinkit Grocery Delivery', amt: 2280, cat: 'Shopping & Groceries', type: TransactionType.EXPENSE, acc: wallet.id, method: PaymentMethod.UPI },
    { date: daysAgo(53), desc: 'Shell Petrol Station Fuel', amt: 2800, cat: 'Transportation', type: TransactionType.EXPENSE, acc: wallet.id, method: PaymentMethod.UPI },
    { date: daysAgo(51), desc: 'Quarterly Dividend Payout', amt: 4800, cat: 'Investments & Dividends', type: TransactionType.INCOME, acc: zerodha.id, method: PaymentMethod.TRANSFER },
    { date: daysAgo(48), desc: 'Cult.fit Annual Gym Renewal', amt: 12500, cat: 'Healthcare & Medical', type: TransactionType.EXPENSE, acc: hdfc.id, method: PaymentMethod.CARD },
    { date: daysAgo(46), desc: 'PVR IMAX Movie & Popcorn', amt: 1450, cat: 'Entertainment & Leisure', type: TransactionType.EXPENSE, acc: wallet.id, method: PaymentMethod.UPI },
    { date: daysAgo(44), desc: 'Blue Tokai Specialty Coffee', amt: 780, cat: 'Food & Dining', type: TransactionType.EXPENSE, acc: wallet.id, method: PaymentMethod.UPI },
    { date: daysAgo(41), desc: 'SIP Mutual Fund Investment (Nifty 50)', amt: 15000, cat: 'Investments & Dividends', type: TransactionType.EXPENSE, acc: zerodha.id, method: PaymentMethod.NET_BANKING },
    { date: daysAgo(38), desc: 'Coursera ML & System Design Specialization', amt: 3999, cat: 'Education & Courses', type: TransactionType.EXPENSE, acc: hdfc.id, method: PaymentMethod.CARD },
    { date: daysAgo(35), desc: 'Weekend Getaway Toll & Resort', amt: 8400, cat: 'Travel & Vacation', type: TransactionType.EXPENSE, acc: hdfc.id, method: PaymentMethod.CARD },
    { date: daysAgo(32), desc: 'Pharmacy & Health Supplements', amt: 1850, cat: 'Healthcare & Medical', type: TransactionType.EXPENSE, acc: wallet.id, method: PaymentMethod.UPI },

    // Month 3 (Current Month / Last 30 Days)
    { date: daysAgo(28), desc: 'TechCorp Monthly Salary', amt: 85000, cat: 'Salary', type: TransactionType.INCOME, acc: hdfc.id, method: PaymentMethod.TRANSFER },
    { date: daysAgo(27), desc: 'Apartment Rent Transfer', amt: 18000, cat: 'Housing & Rent', type: TransactionType.EXPENSE, acc: hdfc.id, method: PaymentMethod.NET_BANKING },
    { date: daysAgo(25), desc: 'Zepto Daily Groceries', amt: 1650, cat: 'Shopping & Groceries', type: TransactionType.EXPENSE, acc: wallet.id, method: PaymentMethod.UPI },
    { date: daysAgo(23), desc: 'Namma Metro Smart Card Recharge', amt: 1000, cat: 'Transportation', type: TransactionType.EXPENSE, acc: wallet.id, method: PaymentMethod.UPI },
    { date: daysAgo(21), desc: 'Freelance Design Consultation Milestone', amt: 18000, cat: 'Freelance & Consulting', type: TransactionType.INCOME, acc: hdfc.id, method: PaymentMethod.TRANSFER },
    { date: daysAgo(19), desc: 'Dinner with Engineering Team', amt: 3400, cat: 'Food & Dining', type: TransactionType.EXPENSE, acc: hdfc.id, method: PaymentMethod.CARD },
    { date: daysAgo(17), desc: 'Amazon Office Desk Accessories', amt: 2899, cat: 'Shopping & Groceries', type: TransactionType.EXPENSE, acc: hdfc.id, method: PaymentMethod.CARD },
    { date: daysAgo(15), desc: 'Electricity Bill & Water Utility', amt: 1840, cat: 'Utilities & Bills', type: TransactionType.EXPENSE, acc: wallet.id, method: PaymentMethod.UPI },
    { date: daysAgo(13), desc: 'SIP Mutual Fund Investment (Nifty 50)', amt: 15000, cat: 'Investments & Dividends', type: TransactionType.EXPENSE, acc: zerodha.id, method: PaymentMethod.NET_BANKING },
    { date: daysAgo(11), desc: 'Standup Comedy Night Tickets', amt: 1600, cat: 'Entertainment & Leisure', type: TransactionType.EXPENSE, acc: wallet.id, method: PaymentMethod.UPI },
    { date: daysAgo(9),  desc: 'Swiggy Instamart Order', amt: 1120, cat: 'Shopping & Groceries', type: TransactionType.EXPENSE, acc: wallet.id, method: PaymentMethod.UPI },
    { date: daysAgo(7),  desc: 'Car Fuel & Tyre Pressure Service', amt: 3200, cat: 'Transportation', type: TransactionType.EXPENSE, acc: wallet.id, method: PaymentMethod.UPI },
    { date: daysAgo(5),  desc: 'Fine Dining Anniversary Dinner', amt: 4500, cat: 'Food & Dining', type: TransactionType.EXPENSE, acc: hdfc.id, method: PaymentMethod.CARD },
    { date: daysAgo(3),  desc: 'Netflix Monthly Subscription', amt: 649, cat: 'Subscriptions', type: TransactionType.EXPENSE, acc: hdfc.id, method: PaymentMethod.CARD, isRecurring: true },
    { date: daysAgo(2),  desc: 'Bookstore Technical Architecture Books', amt: 1850, cat: 'Education & Courses', type: TransactionType.EXPENSE, acc: wallet.id, method: PaymentMethod.UPI },
    { date: daysAgo(1),  desc: 'Artisanal Cafe & Bakery Visit', amt: 940, cat: 'Food & Dining', type: TransactionType.EXPENSE, acc: wallet.id, method: PaymentMethod.UPI },
  ];

  for (const t of txs) {
    await prisma.transaction.create({
      data: {
        userId: demoUser.id,
        accountId: t.acc,
        categoryId: catMap[t.cat],
        description: t.desc,
        amount: t.amt.toString(),
        type: t.type,
        date: t.date,
        paymentMethod: t.method,
        isRecurring: t.isRecurring || false,
      },
    });
  }

  // Create 1 transaction for Alice to verify isolation
  const aliceSalaryCat = await prisma.category.findFirst({ where: { userId: aliceUser.id, name: 'Salary' } });
  const aliceBank = await prisma.account.findFirst({ where: { userId: aliceUser.id } });
  if (aliceSalaryCat && aliceBank) {
    await prisma.transaction.create({
      data: {
        userId: aliceUser.id,
        accountId: aliceBank.id,
        categoryId: aliceSalaryCat.id,
        description: "Alice's Secret Salary",
        amount: '90000.00',
        type: TransactionType.INCOME,
        date: new Date(),
        paymentMethod: PaymentMethod.TRANSFER,
      },
    });
  }

  console.log(`💸 Seeded ${txs.length + 1} transactions`);

  // 8. Create Sample Notifications for Demo User
  await prisma.notification.createMany({
    data: [
      {
        userId: demoUser.id,
        title: 'Monthly Savings Milestone Reached! 🚀',
        message: 'You have achieved a 35%+ savings rate this month. Excellent financial discipline!',
        type: 'GOAL_MILESTONE',
        isRead: false,
      },
      {
        userId: demoUser.id,
        title: 'Budget Alert: Food & Dining ⚠️',
        message: "You've utilized 78% of your monthly Food & Dining budget.",
        type: 'BUDGET_WARNING',
        isRead: false,
      },
      {
        userId: demoUser.id,
        title: 'Upcoming Bill Due 🔔',
        message: 'Airtel Fiber Internet (₹999) is due in 3 days.',
        type: 'RECURRING_DUE',
        isRead: true,
      },
    ],
  });

  console.log('🔔 Created notifications');
  console.log('✅ Seeding completed successfully!');
}

if (require.main === module) {
  seed()
    .catch((e) => {
      console.error('❌ Seeding error:', e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
