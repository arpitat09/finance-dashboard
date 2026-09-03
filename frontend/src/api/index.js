import { apiClient } from './client';

// Auth API
export const authApi = {
  login: (data) => apiClient.post('/auth/login', data),
  register: (data) => apiClient.post('/auth/register', data),
  getMe: () => apiClient.get('/auth/me'),
  updateProfile: (data) => apiClient.patch('/auth/profile', data),
  changePassword: (data) => apiClient.post('/auth/change-password', data),
};

// Transactions API
export const transactionApi = {
  list: (params) => apiClient.get('/transactions', { params }),
  getById: (id) => apiClient.get(`/transactions/${id}`),
  create: (data) => apiClient.post('/transactions', data),
  update: (id, data) => apiClient.put(`/transactions/${id}`, data),
  delete: (id) => apiClient.delete(`/transactions/${id}`),
};

// Categories API
export const categoryApi = {
  list: (type) => apiClient.get('/categories', { params: { type } }),
  create: (data) => apiClient.post('/categories', data),
  update: (id, data) => apiClient.put(`/categories/${id}`, data),
  delete: (id) => apiClient.delete(`/categories/${id}`),
};

// Budgets API
export const budgetApi = {
  list: () => apiClient.get('/budgets'),
  create: (data) => apiClient.post('/budgets', data),
  update: (id, data) => apiClient.put(`/budgets/${id}`, data),
  delete: (id) => apiClient.delete(`/budgets/${id}`),
};

// Goals API
export const goalApi = {
  list: () => apiClient.get('/goals'),
  create: (data) => apiClient.post('/goals', data),
  update: (id, data) => apiClient.put(`/goals/${id}`, data),
  contribute: (id, data) => apiClient.post(`/goals/${id}/contribute`, data),
  delete: (id) => apiClient.delete(`/goals/${id}`),
};

// Accounts API
export const accountApi = {
  list: () => apiClient.get('/accounts'),
  getById: (id) => apiClient.get(`/accounts/${id}`),
  create: (data) => apiClient.post('/accounts', data),
  update: (id, data) => apiClient.put(`/accounts/${id}`, data),
  delete: (id) => apiClient.delete(`/accounts/${id}`),
};

// Recurring API
export const recurringApi = {
  list: () => apiClient.get('/recurring'),
  create: (data) => apiClient.post('/recurring', data),
  update: (id, data) => apiClient.put(`/recurring/${id}`, data),
  delete: (id) => apiClient.delete(`/recurring/${id}`),
  processDue: () => apiClient.post('/recurring/process-due'),
};

// Notifications API
export const notificationApi = {
  list: () => apiClient.get('/notifications'),
  markRead: (id) => apiClient.patch(`/notifications/${id}/read`),
  markAllRead: () => apiClient.patch('/notifications/read-all'),
  delete: (id) => apiClient.delete(`/notifications/${id}`),
};

// Dashboard API
export const dashboardApi = {
  getSummary: (period) => apiClient.get('/dashboard/summary', { params: { period } }),
  getCashFlow: (timeframe) => apiClient.get('/dashboard/cash-flow', { params: { timeframe } }),
  getCategoryBreakdown: (period) => apiClient.get('/dashboard/category-breakdown', { params: { period } }),
  getHealthScore: () => apiClient.get('/dashboard/health-score'),
  getInsights: () => apiClient.get('/dashboard/insights'),
};

// Analytics API
export const analyticsApi = {
  getOverview: () => apiClient.get('/analytics/overview'),
};

// Assistant API
export const assistantApi = {
  ask: (query) => apiClient.post('/assistant/ask', { query }),
};

// Exports API
export const exportApi = {
  getReport: (period) => apiClient.get('/exports/report', { params: { period } }),
  getBackupJSON: () => apiClient.get('/exports/backup/json'),
};
