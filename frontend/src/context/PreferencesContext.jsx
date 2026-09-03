import { createContext, useContext, useState, useEffect } from 'react';
import { formatMoney } from '../utils/helpers';
import { useAuth } from './AuthContext';

const PreferencesContext = createContext(null);

export function PreferencesProvider({ children }) {
  const { user, updateProfile } = useAuth();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('finora_theme') || 'dark';
  });

  const [currency, setCurrencyState] = useState(() => {
    return user?.currency || localStorage.getItem('finora_currency') || 'INR';
  });

  useEffect(() => {
    if (user?.currency && user.currency !== currency) {
      setCurrencyState(user.currency);
    }
  }, [user?.currency]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('finora_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const setCurrency = async (newCurrency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('finora_currency', newCurrency);
    if (user) {
      try {
        await updateProfile({ currency: newCurrency });
      } catch (e) {
        console.error('Failed to sync currency preference to server:', e);
      }
    }
  };

  const fmt = (amount) => formatMoney(amount, currency);

  return (
    <PreferencesContext.Provider
      value={{
        theme,
        isDark: theme === 'dark',
        toggleTheme,
        setTheme,
        currency,
        setCurrency,
        fmt,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
}
