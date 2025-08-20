export interface LeumiCredentials {
  username: string;
  password: string;
}

export interface LeumiOptions {
  validateSchema?: boolean;
  verbose?: boolean;
  startDate?: Date;
}

export interface Transaction {
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

export interface AccountData {
  accountNumber: string;
  balance?: number;
  transactions: Transaction[];
}

export interface ScraperResult {
  success: boolean;
  accounts: AccountData[];
  errorType?: string;
  errorMessage?: string;
}

export interface LeumiScraperMethods {
  getILSTransactions: () => Promise<AccountData[]>;
}