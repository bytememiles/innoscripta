import { useEffect, useState } from 'react';

interface CreditData {
  remaining: number;
  maxCredits: number;
  lastReset: string;
  usedThisMonth: number;
}

const DEFAULT_CREDITS = 5;
const CREDIT_RESET_INTERVAL = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

export const useCredits = (userId?: string) => {
  const [credits, setCredits] = useState<CreditData>({
    remaining: DEFAULT_CREDITS,
    maxCredits: DEFAULT_CREDITS,
    lastReset: new Date().toISOString(),
    usedThisMonth: 0,
  });

  // Generate unique key for each user
  const storageKey = `user_credits_${userId || 'anonymous'}`;

  // Load credits from localStorage
  const loadCredits = (): CreditData => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const data: CreditData = JSON.parse(stored);

        // Check if credits need to be reset
        const now = new Date();
        const lastReset = new Date(data.lastReset);
        const timeSinceReset = now.getTime() - lastReset.getTime();

        if (timeSinceReset >= CREDIT_RESET_INTERVAL) {
          // Reset credits for new month
          const resetData: CreditData = {
            remaining: DEFAULT_CREDITS,
            maxCredits: DEFAULT_CREDITS,
            lastReset: now.toISOString(),
            usedThisMonth: 0,
          };
          localStorage.setItem(storageKey, JSON.stringify(resetData));
          return resetData;
        }

        return data;
      }
    } catch (error) {
      console.error('Error loading credits from localStorage:', error);
    }

    // Return default credits if nothing stored or error
    return {
      remaining: DEFAULT_CREDITS,
      maxCredits: DEFAULT_CREDITS,
      lastReset: new Date().toISOString(),
      usedThisMonth: 0,
    };
  };

  // Save credits to localStorage
  const saveCredits = (data: CreditData) => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving credits to localStorage:', error);
    }
  };

  // Use a credit (deduct from remaining)
  const deductCredit = (): boolean => {
    if (credits.remaining <= 0) {
      return false; // No credits available
    }

    const newCredits: CreditData = {
      ...credits,
      remaining: credits.remaining - 1,
      usedThisMonth: credits.usedThisMonth + 1,
    };

    setCredits(newCredits);
    saveCredits(newCredits);
    return true;
  };

  // Check if user has credits available
  const hasCredits = (): boolean => {
    return credits.remaining > 0;
  };

  // Get credit status for display
  const getCreditStatus = () => {
    if (credits.remaining <= 1) return 'Low credits - Use wisely!';
    if (credits.remaining <= 2) return 'Credits running low';
    return 'Credits available';
  };

  // Get next reset date
  const getNextResetDate = (): Date => {
    const lastReset = new Date(credits.lastReset);
    return new Date(lastReset.getTime() + CREDIT_RESET_INTERVAL);
  };

  // Format time until reset
  const getTimeUntilReset = (): string => {
    const now = new Date();
    const nextReset = getNextResetDate();
    const diffInMs = nextReset.getTime() - now.getTime();
    const diffInDays = Math.ceil(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays <= 0) return 'Today';
    if (diffInDays === 1) return 'Tomorrow';
    if (diffInDays < 7) return `In ${diffInDays} days`;
    return nextReset.toLocaleDateString();
  };

  // Initialize credits on mount
  useEffect(() => {
    const loadedCredits = loadCredits();
    setCredits(loadedCredits);
  }, [userId]);

  // Update localStorage when credits change
  useEffect(() => {
    saveCredits(credits);
  }, [credits]);

  return {
    credits,
    deductCredit,
    hasCredits,
    getCreditStatus,
    getNextResetDate,
    getTimeUntilReset,
    remaining: credits.remaining,
    maxCredits: credits.maxCredits,
    usedThisMonth: credits.usedThisMonth,
  };
};
