const puppeteer = require('puppeteer');
require('dotenv').config();

async function debugTransactions() {
  console.log('🚀 Starting transaction debug...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 1000
  });
  
  const page = await browser.newPage();
  
  const credentials = {
    username: process.env.LEUMI_USERNAME || '',
    password: process.env.LEUMI_PASSWORD || ''
  };
  
  try {
    console.log('🚪 Going to login page...');
    await page.goto('https://hb2.bankleumi.co.il/H/Login.html', { waitUntil: 'networkidle2' });
    
    console.log('⏳ Waiting and logging in...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Fill username
    await page.click('input[placeholder="שם משתמש"]');
    await page.type('input[placeholder="שם משתמש"]', credentials.username);
    
    // Fill password  
    await page.click('input[placeholder="סיסמה"]');
    await page.type('input[placeholder="סיסמה"]', credentials.password);
    
    // Submit
    await page.click('button[type="submit"]');
    
    console.log('⏳ Waiting for login to complete...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('💰 Going to transactions page...');
    const transactionUrl = 'https://hb2.bankleumi.co.il/eBanking/SO/SPA.aspx#/ts/BusinessAccountTrx?WidgetPar=1';
    await page.goto(transactionUrl, { waitUntil: 'networkidle2' });
    
    console.log('⏳ Waiting for transactions page to load...');
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    console.log('📸 Taking screenshot of transactions page...');
    await page.screenshot({ path: 'transactions-page.png', fullPage: true });
    
    console.log('🔍 Looking for account elements...');
    
    // Check for account dropdown
    const accountElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('app-masked-number-combo span.display-number-li');
      return Array.from(elements).map(el => el.textContent);
    });
    
    console.log('Account elements found:', accountElements);
    
    // Look for advanced search button
    const advancedSearchElements = await page.$$('button[title="חיפוש מתקדם"]');
    console.log(`Advanced search buttons found: ${advancedSearchElements.length}`);
    
    console.log('⏳ Waiting 15 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'transaction-debug-error.png', fullPage: true });
  }
  
  await browser.close();
  console.log('🔚 Transaction debug complete');
}

debugTransactions().catch(console.error);