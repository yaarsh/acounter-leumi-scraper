import { Page } from 'puppeteer';
import { format, subYears } from 'date-fns';
import { 
  LeumiCredentials, 
  LeumiOptions, 
  LeumiScraperMethods, 
  AccountData,
  Transaction 
} from '../types';

const BASE_URL = 'https://hb2.bankleumi.co.il';
const TRANSACTIONS_URL = `${BASE_URL}/eBanking/SO/SPA.aspx#/ts/BusinessAccountTrx?WidgetPar=1`;
const FILTERED_TRANSACTIONS_URL = `${BASE_URL}/ChannelWCF/Broker.svc/ProcessRequest?moduleName=UC_SO_27_GetBusinessAccountTrx`;

const DATE_FORMAT = 'dd.MM.yy';

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function waitForElement(page: Page, selector: string, timeout = 30000): Promise<void> {
  await page.waitForSelector(selector, { visible: true, timeout });
}

async function clickElement(page: Page, selector: string): Promise<void> {
  await waitForElement(page, selector);
  await page.click(selector);
}

async function fillInputField(page: Page, selector: string, value: string): Promise<void> {
  await waitForElement(page, selector);
  await page.click(selector);
  await page.evaluate(selector => {
    const element = document.querySelector(selector) as HTMLInputElement;
    if (element) element.value = '';
  }, selector);
  await page.type(selector, value);
}

async function performLogin(page: Page, credentials: LeumiCredentials): Promise<void> {
  console.log('🔐 Starting login process...');
  
  await page.goto('https://hb2.bankleumi.co.il/H/Login.html', { waitUntil: 'networkidle2', timeout: 15000 });
  await delay(3000);
  
  // Fill username
  console.log('📝 Filling username...');
  await fillInputField(page, 'input[placeholder="שם משתמש"]', credentials.username);
  
  // Fill password
  console.log('🔐 Filling password...');
  await fillInputField(page, 'input[placeholder="סיסמה"]', credentials.password);
  
  // Submit
  console.log('🚀 Submitting login form...');
  await clickElement(page, 'button[type="submit"]');
  
  // Wait for login result - using the original logic
  await Promise.race([
    page.waitForSelector('a[title="דלג לחשבון"]', { timeout: 60000 }),
    page.waitForSelector('div.main-content', { timeout: 60000 }),
    page.waitForSelector(`xpath//div[contains(string(),"אחד או יותר מפרטי ההזדהות שמסרת שגויים")]`, { timeout: 60000 })
  ]);
  
  // Check for login errors
  const errorElement = await page.$(`xpath//div[contains(string(),"אחד או יותר מפרטי ההזדהות שמסרת שגויים")]`);
  if (errorElement) {
    throw new Error('Invalid credentials provided');
  }
  
  console.log('✅ Login successful');
}

// This is the core working function from the original israeli-bank-scrapers
async function fetchTransactionsForAccount(
  page: Page, 
  startDate: Date,
  accountId: string
): Promise<AccountData> {
  console.log(`📊 Fetching transactions for account: ${accountId}`);
  
  // DEVELOPER NOTICE: Wait for dynamic content to stabilize (from original code)
  await delay(4000);

  await waitForElement(page, 'button[title="חיפוש מתקדם"]', 30000);
  await clickElement(page, 'button[title="חיפוש מתקדם"]');
  
  await waitForElement(page, 'bll-radio-button', 30000);
  await clickElement(page, 'bll-radio-button:not([checked])');

  await waitForElement(page, 'input[formcontrolname="txtInputFrom"]', 30000);

  const formattedDate = format(startDate, DATE_FORMAT);
  await page.evaluate((selector) => {
    const element = document.querySelector(selector) as HTMLInputElement;
    if (element) element.value = '';
  }, 'input[formcontrolname="txtInputFrom"]');

  await fillInputField(page, 'input[formcontrolname="txtInputFrom"]', formattedDate);

  // Focus away to trigger validation (from original code)
  await page.focus("button[aria-label='סנן']");

  // Wait for API response and click search (core part from original)
  const responsePromise = page.waitForResponse(response => {
    return response.url() === FILTERED_TRANSACTIONS_URL && response.request().method() === 'POST';
  });

  await clickElement(page, "button[aria-label='סנן']");
  const finalResponse = await responsePromise;

  const responseJson: any = await finalResponse.json();
  const response = JSON.parse(responseJson.jsonResp);

  // Extract data exactly like the original
  const pendingTransactions = response.TodayTransactionsItems;
  const transactions = response.HistoryTransactionsItems;
  const balance = response.BalanceDisplay ? parseFloat(response.BalanceDisplay) : undefined;

  const pendingTxns = extractTransactions(pendingTransactions, 'pending');
  const completedTxns = extractTransactions(transactions, 'completed');
  const txns = [...pendingTxns, ...completedTxns];

  // Clean account number like original
  const accountNumber = accountId.replace('/', '_').replace(/[^\d\-_]/g, '');

  return {
    accountNumber,
    balance,
    transactions: txns,
  };
}

// Transaction parsing from original code, adapted to our types
function extractTransactions(rawTransactions: any[], status: string): Transaction[] {
  if (!rawTransactions || rawTransactions.length === 0) {
    return [];
  }

  return rawTransactions.map(rawTransaction => {
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
  });
}

async function fetchAllTransactions(page: Page, startDate: Date): Promise<AccountData[]> {
  const accounts: AccountData[] = [];

  // Wait for dynamic content (from original)
  await delay(4000);

  // Get account IDs exactly like original
  const accountsIds = await page.evaluate(() =>
    Array.from(document.querySelectorAll('app-masked-number-combo span.display-number-li'), 
               (e: Element) => e.textContent)
  ) as string[];

  if (!accountsIds.length) {
    throw new Error('Failed to extract or parse the account number');
  }

  console.log(`Found ${accountsIds.length} accounts: ${accountsIds.join(', ')}`);

  for (const accountId of accountsIds) {
    if (accountsIds.length > 1) {
      // Multi-account selection logic from original
      await page.click('xpath///*[contains(@class, "number") and contains(@class, "combo-inner")]');
      await page.click(`xpath///span[contains(text(), '${accountId}')]`);
    }

    const accountData = await fetchTransactionsForAccount(page, startDate, accountId);
    accounts.push(accountData);
  }

  return accounts;
}

export async function leumi(
  page: Page,
  credentials: LeumiCredentials,
  options: LeumiOptions = {}
): Promise<LeumiScraperMethods> {
  const startDate = options.startDate || subYears(new Date(), 1);

  // Perform login
  await performLogin(page, credentials);
  
  // Navigate to transactions page
  console.log('💰 Navigating to transactions page...');
  await page.goto(TRANSACTIONS_URL, { waitUntil: 'networkidle2', timeout: 15000 });

  const getILSTransactions = async (): Promise<AccountData[]> => {
    try {
      console.log('📊 Starting transaction extraction...');
      return await fetchAllTransactions(page, startDate);
    } catch (error) {
      if (options.verbose) {
        console.error('Error fetching ILS transactions:', error);
      }
      throw error;
    }
  };

  return {
    getILSTransactions
  };
}