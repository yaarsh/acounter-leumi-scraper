# 🏦 Acounter Leumi Bank Scraper

A TypeScript implementation of a Leumi bank scraper following the acounter project patterns.

> ⚠️ **Important**: This scraper is for educational and personal use only. Use responsibly and in compliance with your bank's terms of service.

## Features

- 🏦 **Bank Leumi Support**: Scrapes transaction data from Leumi online banking
- 🔐 **Secure Authentication**: Handles login with username/password
- 💰 **ILS Transactions**: Retrieves local currency transactions
- 🏗️ **Modular Architecture**: Follows acounter project structure
- 🛡️ **Type Safety**: Full TypeScript implementation
- 🎯 **Focused API**: Clean interface similar to Hapoalim scraper

## Installation

```bash
npm install
npm run build
```

## Usage

### Basic Usage

```typescript
import { init } from './src/index';

async function example() {
  // Initialize scraper
  const scraper = await init({ headless: false });
  
  // Create Leumi scraper instance
  const leumiScraper = await scraper.leumi({
    username: 'your_username',
    password: 'your_password'
  }, {
    startDate: new Date('2024-01-01'),
    verbose: true
  });
  
  // Get ILS transactions
  const accounts = await leumiScraper.getILSTransactions();
  
  console.log(`Found ${accounts.length} accounts`);
  accounts.forEach(account => {
    console.log(`Account: ${account.accountNumber}`);
    console.log(`Balance: ₪${account.balance}`);
    console.log(`Transactions: ${account.transactions.length}`);
  });
  
  // Close browser
  await scraper.close();
}
```

### Environment Variables

For testing, create a `.env` file:

```bash
LEUMI_USERNAME=your_username
LEUMI_PASSWORD=your_password
```

## API Reference

### `init(options?)`

Initialize the scraper with browser options.

**Parameters:**
- `headless?: boolean` - Run browser in headless mode (default: true)
- `userAgent?: string` - Custom user agent
- `executablePath?: string` - Path to Chrome executable
- `args?: string[]` - Additional Chrome arguments

### `leumi(credentials, options?)`

Create a Leumi scraper instance.

**Parameters:**
- `credentials: LeumiCredentials`
  - `username: string` - Leumi username
  - `password: string` - Leumi password
- `options?: LeumiOptions`
  - `startDate?: Date` - Start date for transactions (default: 1 year ago)
  - `validateSchema?: boolean` - Enable data validation
  - `verbose?: boolean` - Enable detailed logging

**Returns:** `LeumiScraperMethods`
- `getILSTransactions(): Promise<AccountData[]>` - Fetch ILS transactions

### Types

```typescript
interface AccountData {
  accountNumber: string;
  balance?: number;
  transactions: Transaction[];
}

interface Transaction {
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
```

## Testing

```bash
# Build the project
npm run build

# Run test (requires environment variables)
npm test
```

## Architecture

The scraper follows the acounter project patterns:

```
src/
├── index.ts          # Main entry point with init function
├── types.ts          # TypeScript interfaces and types
└── scrapers/
    └── leumi.ts      # Leumi-specific scraper implementation
```

### Key Components

1. **Browser Management**: Uses Puppeteer for web automation
2. **Authentication**: Handles Leumi's login flow with error detection
3. **Data Extraction**: Intercepts API calls for reliable data retrieval
4. **Type Safety**: Comprehensive TypeScript types throughout

## Implementation Details

- **Login Flow**: Navigates to Leumi homepage → login page → authentication
- **Transaction Retrieval**: Uses advanced search with date filtering
- **API Interception**: Captures internal API responses instead of DOM scraping
- **Multi-Account Support**: Automatically handles multiple accounts
- **Error Handling**: Detects invalid credentials, blocked accounts, etc.

## Security Notes

- Never commit credentials to version control
- Use environment variables for sensitive data
- Consider using encrypted credential storage for production
- Review network requests if running in production environments

---

Based on the israeli-bank-scrapers library and adapted for the acounter project structure.