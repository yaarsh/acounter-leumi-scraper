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
          const date = new Date(txn.DateUTC).toLocaleDateString('he-IL');
          const amount = txn.Amount > 0 
            ? `+₪${txn.Amount.toLocaleString()}` 
            : `-₪${Math.abs(txn.Amount).toLocaleString()}`;
          console.log(`  ${txnIndex + 1}. ${date} | ${amount} | ${txn.Description}`);
          console.log(`    💰 Credit: ₪${txn.Credit}, Debit: ₪${txn.Debit}`);
          console.log(`    🏦 Running Balance: ₪${txn.RunningBalance}`);
          console.log(`    📄 Memo: ${txn.AdditionalData}`);
        });
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
  } finally {
    await scraper.close();
    console.log('🔚 Browser closed');
  }
}

if (require.main === module) {
  testLeumiScraper().catch(console.error);
}

export { testLeumiScraper };