/**
 * Raw Leumi transaction types - preserves ALL data from Leumi's API
 * This maintains the full richness of Leumi-specific data
 */

export interface LeumiCredentials {
  username: string;
  password: string;
}

export interface LeumiOptions {
  validateSchema?: boolean;
  verbose?: boolean;
  startDate?: Date;
}

/**
 * Raw transaction data as returned by Leumi's API
 * Contains all 25+ fields with complete information
 */
export interface LeumiRawTransaction {
  /** UTC timestamp from Leumi API */
  DateUTC: string;
  /** Leumi's local date format (DD/MM/YYYY) */
  DateSO: string;
  /** Transaction amount (positive for credit, negative for debit when processed) */
  Amount: number;
  /** Credit amount (0 if debit transaction) */
  Credit: number;
  /** Debit amount (0 if credit transaction) */
  Debit: number;
  /** True for credit, false for debit */
  TransactionSign: boolean;
  /** Primary transaction description */
  Description: string;
  /** Account balance after this transaction */
  RunningBalance: number;
  /** Effective date UTC timestamp */
  EffectiveDateUTC: string;
  /** Effective date in Leumi format */
  EffectiveDateSO: string;
  /** Leumi reference number */
  ReferenceNumberLong: number;
  /** Internal transaction type code */
  TypeInt: number;
  /** Whether additional description exists */
  AdditionalDescriptionIdentifier: boolean;
  /** Extended transaction details/memo */
  AdditionalData: string;
  /** Additional activity type classification */
  AdditionalActivityTypeInt: number;
  /** Segmentation flag for categorization */
  SegmentationFlagInt: number;
  /** Extension type code for transaction classification */
  ExtensionTypeCode: number;
  /** Credit card index (0 if not credit card related) */
  CreditCardIndex: number;
  /** Period information */
  Period: number;
  /** Internal linking identifier */
  IfLinkInt: number;
  /** Invoice status (null for most transactions) */
  InvoiceStatus: any;
  /** Check number for check transactions */
  CheckNumberLong: number;
  /** Financial Institution Transaction ID */
  FITID: string;
  /** Transaction index in the response */
  TrxIndex: number;
}

/**
 * Raw API response structure from Leumi
 */
export interface LeumiRawApiResponse {
  /** User preference settings */
  UserPreferenceItems: any[];
  /** Historical completed transactions */
  HistoryTransactionsItems: LeumiRawTransaction[];
  /** Today's pending transactions */
  TodayTransactionsItems: LeumiRawTransaction[];
  /** API status information */
  SOStatus: any;
  /** Flag indicating if today's transactions are included */
  TodayFlag: boolean;
  /** Current account balance as string */
  BalanceDisplay: string;
  /** Balance including today's transactions */
  BalanceIncludingToday: number;
  /** Balance delays information */
  BalanceDelays: any;
  /** Balance including delays */
  BalanceIncludingDelays: number;
  /** Total credit amount */
  TotalCredit: number;
  /** As of date UTC */
  AsOfDateUTC: string;
  /** Request type identifier */
  RequestType: number;
}

/**
 * Processed account data with raw Leumi transactions
 */
export interface LeumiRawAccountData {
  /** Account number in Leumi format */
  accountNumber: string;
  /** Current account balance */
  balance?: number;
  /** Array of raw transactions with all Leumi data preserved */
  transactions: LeumiRawTransaction[];
  /** Raw API response metadata for advanced use cases */
  metadata?: {
    balanceIncludingToday: number;
    totalCredit: number;
    asOfDate: string;
    todayFlag: boolean;
  };
}

/**
 * Transaction status based on which array it came from
 */
export type LeumiTransactionStatus = 'completed' | 'pending';

/**
 * Main scraper interface returning raw Leumi data
 */
export interface LeumiRawScraperMethods {
  /** Get ILS transactions with full Leumi data preserved */
  getILSTransactions: () => Promise<LeumiRawAccountData[]>;
}

/**
 * Enhanced transaction with computed convenience fields
 */
export interface LeumiEnhancedTransaction extends LeumiRawTransaction {
  /** Computed status: 'completed' | 'pending' */
  status: LeumiTransactionStatus;
  /** Parsed date as Date object */
  parsedDate: Date;
  /** Parsed effective date as Date object */
  parsedEffectiveDate: Date;
  /** Is this a debit transaction? */
  isDebit: boolean;
  /** Is this a credit transaction? */
  isCredit: boolean;
  /** Absolute transaction amount */
  absoluteAmount: number;
}