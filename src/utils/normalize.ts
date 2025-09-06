/**
 * Optional normalization utilities
 * Use these ONLY if you need compatibility with israeli-bank-scrapers format
 * WARNING: This will lose Leumi-specific data!
 */

import {
  LeumiRawTransaction,
  LeumiRawAccountData,
  NormalizedTransaction,
  NormalizedAccountData,
} from '../types';

/**
 * Convert a raw Leumi transaction to normalized format
 * WARNING: This loses 20+ fields of rich Leumi data!
 */
export function normalizeTransaction(
  rawTransaction: LeumiRawTransaction,
  status: 'completed' | 'pending' = 'completed'
): NormalizedTransaction {
  const date = new Date(rawTransaction.DateUTC);
  
  return {
    date,
    processedDate: date,
    originalAmount: rawTransaction.Amount,
    originalCurrency: 'ILS',
    chargedAmount: rawTransaction.Amount,
    chargedCurrency: 'ILS',
    description: rawTransaction.Description || '',
    memo: rawTransaction.AdditionalData || '',
    type: 'normal',
    status,
    identifier: rawTransaction.ReferenceNumberLong,
  };
}

/**
 * Convert raw Leumi account data to normalized format  
 * WARNING: This loses metadata and detailed transaction fields!
 */
export function normalizeAccountData(rawAccountData: LeumiRawAccountData): NormalizedAccountData {
  return {
    accountNumber: rawAccountData.accountNumber,
    balance: rawAccountData.balance,
    transactions: rawAccountData.transactions.map(txn => {
      // Determine status based on original arrays (best guess)
      // Note: This is imperfect since we've already merged the arrays
      const status = txn.RunningBalance ? 'completed' : 'pending';
      return normalizeTransaction(txn, status as 'completed' | 'pending');
    }),
  };
}

/**
 * Convert array of raw account data to normalized format
 * Use this if you absolutely need israeli-bank-scrapers compatibility
 */
export function normalizeAllAccounts(rawAccounts: LeumiRawAccountData[]): NormalizedAccountData[] {
  return rawAccounts.map(normalizeAccountData);
}

/**
 * Create a wrapper that provides both raw and normalized data
 * Best of both worlds - preserve raw data but also offer normalized access
 */
export function createDualFormatAccount(rawAccountData: LeumiRawAccountData) {
  return {
    // Raw data (default, preserves everything)
    raw: rawAccountData,
    
    // Normalized data (legacy compatibility)  
    normalized: normalizeAccountData(rawAccountData),
    
    // Convenience methods
    getRawTransactions: () => rawAccountData.transactions,
    getNormalizedTransactions: () => normalizeAllAccounts([rawAccountData])[0].transactions,
    
    // Metadata access
    getMetadata: () => rawAccountData.metadata,
    
    // Enhanced fields that aren't in normalized format
    getEnhancedFields: () => ({
      runningBalances: rawAccountData.transactions.map(t => t.RunningBalance),
      transactionTypes: rawAccountData.transactions.map(t => t.TypeInt),
      effectiveDates: rawAccountData.transactions.map(t => t.EffectiveDateUTC),
      creditDebitSplit: rawAccountData.transactions.map(t => ({
        credit: t.Credit,
        debit: t.Debit,
        sign: t.TransactionSign
      })),
    })
  };
}