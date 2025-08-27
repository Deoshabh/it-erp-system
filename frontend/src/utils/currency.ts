/**
 * Currency utilities for Indian Rupee (INR) formatting
 */

// Indian numbering system with lakhs and crores
export const formatCurrency = (amount: number): string => {
  if (amount === 0) return '₹0';
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Convert to Indian numbering system
  let formattedAmount: string;
  
  if (absAmount >= 10000000) { // 1 crore and above
    formattedAmount = `${(absAmount / 10000000).toFixed(2)} Cr`;
  } else if (absAmount >= 100000) { // 1 lakh and above
    formattedAmount = `${(absAmount / 100000).toFixed(2)} L`;
  } else if (absAmount >= 1000) { // 1 thousand and above
    formattedAmount = `${(absAmount / 1000).toFixed(2)} K`;
  } else {
    formattedAmount = absAmount.toFixed(2);
  }
  
  const prefix = isNegative ? '-₹' : '₹';
  return prefix + formattedAmount;
};

// Full Indian currency formatter with commas
export const formatFullCurrency = (amount: number): string => {
  if (amount === 0) return '₹0.00';
  
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Format with Indian comma system (XX,XX,XXX)
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
  }).format(absAmount);
  
  return isNegative ? `-${formatted}` : formatted;
};

// Format currency for display in tables/lists
export const formatCurrencyCompact = (amount: number): string => {
  return formatCurrency(amount);
};

// Parse currency string back to number
export const parseCurrency = (currencyString: string): number => {
  if (!currencyString) return 0;
  
  // Remove currency symbol and spaces
  const cleanString = currencyString.replace(/[₹,\s]/g, '');
  
  // Handle abbreviated formats
  if (cleanString.includes('Cr')) {
    return parseFloat(cleanString.replace('Cr', '')) * 10000000;
  } else if (cleanString.includes('L')) {
    return parseFloat(cleanString.replace('L', '')) * 100000;
  } else if (cleanString.includes('K')) {
    return parseFloat(cleanString.replace('K', '')) * 1000;
  }
  
  return parseFloat(cleanString) || 0;
};

// Validate currency input
export const isValidCurrency = (amount: string): boolean => {
  const cleaned = amount.replace(/[₹,\s]/g, '');
  const number = parseFloat(cleaned);
  return !isNaN(number) && number >= 0;
};

// Format for form inputs
export const formatCurrencyInput = (amount: string): string => {
  const number = parseFloat(amount.replace(/[₹,\s]/g, ''));
  if (isNaN(number)) return '';
  return formatFullCurrency(number);
};

// Currency constants
export const CURRENCY_SYMBOL = '₹';
export const CURRENCY_CODE = 'INR';
export const CURRENCY_NAME = 'Indian Rupee';