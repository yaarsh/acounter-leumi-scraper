const puppeteer = require('puppeteer');
require('dotenv').config();

async function debugRawData() {
  console.log('🔍 Debugging raw transaction data from Leumi API...');
  
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  
  const credentials = {
    username: process.env.LEUMI_USERNAME || '',
    password: process.env.LEUMI_PASSWORD || ''
  };
  
  try {
    // Login
    await page.goto('https://hb2.bankleumi.co.il/H/Login.html', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 3000));
    
    await page.type('input[placeholder="שם משתמש"]', credentials.username);
    await page.type('input[placeholder="סיסמה"]', credentials.password);
    await page.click('button[type="submit"]');
    
    await new Promise(r => setTimeout(r, 5000));
    
    // Go to transactions
    await page.goto('https://hb2.bankleumi.co.il/eBanking/SO/SPA.aspx#/ts/BusinessAccountTrx?WidgetPar=1', { waitUntil: 'networkidle2' });
    
    // Handle popup
    await new Promise(r => setTimeout(r, 3000));
    try {
      const popup = await page.$('img.wm-visual-design-image');
      if (popup) {
        await page.click('button.wm-visual-design-button');
        await new Promise(r => setTimeout(r, 3000));
      }
    } catch {}
    
    // Wait for page
    await new Promise(r => setTimeout(r, 4000));
    
    // Click advanced search
    await page.click('button[title="חיפוש מתקדם"]');
    await page.click('bll-radio-button:not([checked])');
    await page.waitForSelector('input[formcontrolname="txtInputFrom"]');
    
    // Set date
    await page.evaluate(() => {
      const input = document.querySelector('input[formcontrolname="txtInputFrom"]');
      if (input) input.value = '';
    });
    await page.type('input[formcontrolname="txtInputFrom"]', '01.08.25');
    await page.focus("button[aria-label='סנן']");
    
    // Intercept API response
    const responsePromise = page.waitForResponse(response => {
      return response.url().includes('UC_SO_27_GetBusinessAccountTrx') && response.request().method() === 'POST';
    });
    
    await page.click("button[aria-label='סנן']");
    const response = await responsePromise;
    
    const responseJson = await response.json();
    const parsedResponse = JSON.parse(responseJson.jsonResp);
    
    console.log('\n🔍 RAW API RESPONSE STRUCTURE:');
    console.log('=====================================');
    
    // Log the full structure of the first few transactions
    const transactions = parsedResponse.HistoryTransactionsItems || [];
    const pendingTransactions = parsedResponse.TodayTransactionsItems || [];
    
    console.log('\n📊 RESPONSE OVERVIEW:');
    console.log(`- History Transactions: ${transactions.length}`);
    console.log(`- Pending Transactions: ${pendingTransactions.length}`);
    console.log(`- Balance Display: ${parsedResponse.BalanceDisplay}`);
    console.log(`- Other fields: ${Object.keys(parsedResponse).join(', ')}`);
    
    if (transactions.length > 0) {
      console.log('\n💰 SAMPLE TRANSACTION STRUCTURE:');
      console.log('=====================================');
      const sampleTransaction = transactions[0];
      console.log('All available fields:', Object.keys(sampleTransaction));
      console.log('\nFull sample transaction:');
      console.log(JSON.stringify(sampleTransaction, null, 2));
      
      console.log('\n📋 FIELD ANALYSIS:');
      Object.entries(sampleTransaction).forEach(([key, value]) => {
        console.log(`- ${key}: ${typeof value} = ${value}`);
      });
    }
    
    if (pendingTransactions.length > 0) {
      console.log('\n⏳ PENDING TRANSACTION STRUCTURE:');
      console.log('=====================================');
      const samplePending = pendingTransactions[0];
      console.log('Pending transaction fields:', Object.keys(samplePending));
      console.log(JSON.stringify(samplePending, null, 2));
    }
    
    // Save raw data to file for analysis
    const fs = require('fs');
    fs.writeFileSync('leumi-raw-api-response.json', JSON.stringify(parsedResponse, null, 2));
    console.log('\n💾 Raw API response saved to: leumi-raw-api-response.json');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  
  await new Promise(r => setTimeout(r, 5000));
  await browser.close();
}

debugRawData().catch(console.error);