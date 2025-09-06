/**
 * Main types for Acounter Leumi Scraper
 * Default export uses RAW Leumi data to preserve all information
 */

// Re-export raw Leumi types as the default
export * from './types/leumi-raw';

// Also export normalized types for backward compatibility
export * from './types/normalized';

// Convenience re-exports with clearer names
export {
  LeumiCredentials,
  LeumiOptions,
  LeumiRawAccountData as AccountData,
  LeumiRawTransaction as Transaction,
  LeumiRawScraperMethods as LeumiScraperMethods,
} from './types/leumi-raw';

// Legacy support - use these if you want the old normalized format
export {
  NormalizedAccountData as LegacyAccountData,
  NormalizedTransaction as LegacyTransaction,
  NormalizedScraperMethods as LegacyScraperMethods,
} from './types/normalized';