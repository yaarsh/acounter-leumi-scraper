/**
 * Normalized transaction types - compatible with israeli-bank-scrapers format
 * This is the "lowest common denominator" schema that fits all banks
 * WARNING: Using this schema will lose bank-specific data!
 */

export interface NormalizedCredentials {
  username: string;
  password: string;
}

export interface NormalizedOptions {
  validateSchema?: boolean;
  verbose?: boolean;
  startDate?: Date;
}

export interface NormalizedTransaction {
  date: Date;
  processedDate: Date;
  originalAmount: number;
  originalCurrency: string;
  chargedAmount: number;
  chargedCurrency: string;
  description: string;
  memo: string;
  type: string;
  status: string;
  identifier?: string | number;
}

export interface NormalizedAccountData {
  accountNumber: string;
  balance?: number;
  transactions: NormalizedTransaction[];
}

export interface NormalizedScraperMethods {
  getILSTransactions: () => Promise<NormalizedAccountData[]>;
}