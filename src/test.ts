import { init } from './index';
import { LeumiCredentials } from './types';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

async function testLeumiScraper() {
  const scraper = await init({ 
    headless: false,
    args: ['--no-sandbox', '--disable-web-security'] // Additional debugging args
  }); // Show browser for debugging
  
  const credentials: LeumiCredentials = {
    username: process.env.LEUMI_USERNAME || '',
    password: process.env.LEUMI_PASSWORD || ''
  };
  
  if (!credentials.username || !credentials.password) {
    console.error('Please set LEUMI_USERNAME and LEUMI_PASSWORD environment variables');
    process.exit(1);
  }
  
  try {
    console.log('🚀 Initializing Leumi scraper...');
    
    const leumiScraper = await scraper.leumi(credentials, {
      verbose: true,
      startDate: new Date('2024-01-01')
    });
    
    console.log('✅ Login successful, fetching transactions...');
    
    const accounts = await leumiScraper.getILSTransactions();
    
    console.log(`📊 Found ${accounts.length} account(s):`);
    
    accounts.forEach((account, index) => {
      console.log(`\n--- Account ${index + 1} ---`);
      console.log(`Account Number: ${account.accountNumber}`);
      console.log(`Balance: ${account.balance ? `₪${account.balance.toLocaleString()}` : 'N/A'}`);
      console.log(`Transactions: ${account.transactions.length}`);
      
      if (account.transactions.length > 0) {
        console.log('Recent transactions:');
        account.transactions.slice(0, 5).forEach((txn, txnIndex) => {
          const date = txn.date.toLocaleDateString('he-IL');
          const amount = txn.chargedAmount > 0 
            ? `+₪${txn.chargedAmount.toLocaleString()}` 
            : `-₪${Math.abs(txn.chargedAmount).toLocaleString()}`;
          console.log(`  ${txnIndex + 1}. ${date} | ${amount} | ${txn.description}`);
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
  } finally {
    console.log('⏳ Keeping browser open for inspection...');
    console.log('Press Ctrl+C to close when done inspecting');
    
    // Keep the browser open - don't close automatically
    // await scraper.close();
    
    // Wait indefinitely until user presses Ctrl+C
    await new Promise(() => {}); // This will keep the process running
  }
}

if (require.main === module) {
  testLeumiScraper().catch(console.error);
}

export { testLeumiScraper };