const puppeteer = require('puppeteer');
require('dotenv').config();

async function debugFillFields() {
  console.log('🚀 Starting field filling debug test...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true,
    slowMo: 2000 // Very slow to see each action clearly
  });
  
  const page = await browser.newPage();
  
  const credentials = {
    username: process.env.LEUMI_USERNAME || '',
    password: process.env.LEUMI_PASSWORD || ''
  };
  
  if (!credentials.username || !credentials.password) {
    console.error('❌ Missing credentials in .env file');
    await browser.close();
    return;
  }
  
  try {
    console.log('📱 Step 1: Navigate to homepage and then login page...');
    await page.goto('https://www.leumi.co.il/', { waitUntil: 'networkidle2' });
    
    // Get login URL and navigate directly
    const loginUrl = await page.evaluate(() => {
      const element = document.querySelector('.enter-account a[originaltitle="כניסה לחשבונך"]');
      return element?.href;
    });
    
    console.log(`🔗 Navigating to: ${loginUrl}`);
    await page.goto(loginUrl);
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    
    console.log('⏳ Waiting 3 seconds for page to fully load...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('🔍 Step 2: Attempting to fill username field...');
    const usernameSelector = 'input[placeholder="שם משתמש"]';
    
    try {
      await page.waitForSelector(usernameSelector, { visible: true, timeout: 10000 });
      console.log('   ✅ Username field found');
      
      // Clear field first
      await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        if (element) element.value = '';
      }, usernameSelector);
      
      // Try multiple methods to fill username
      console.log('   📝 Method 1: Using page.type()...');
      await page.focus(usernameSelector);
      await page.type(usernameSelector, credentials.username, { delay: 100 });
      
      // Check if it worked
      const usernameValue = await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        return element ? element.value : 'NOT_FOUND';
      }, usernameSelector);
      console.log(`   Username field value: "${usernameValue}"`);
      
      if (usernameValue !== credentials.username) {
        console.log('   📝 Method 2: Using page.evaluate() to set value directly...');
        await page.evaluate((selector, value) => {
          const element = document.querySelector(selector);
          if (element) {
            element.value = value;
            element.dispatchEvent(new Event('input', { bubbles: true }));
            element.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }, usernameSelector, credentials.username);
        
        const usernameValue2 = await page.evaluate((selector) => {
          const element = document.querySelector(selector);
          return element ? element.value : 'NOT_FOUND';
        }, usernameSelector);
        console.log(`   Username field value after method 2: "${usernameValue2}"`);
      }
      
    } catch (error) {
      console.error('   ❌ Error finding username field:', error.message);
    }
    
    console.log('🔍 Step 3: Attempting to fill password field...');
    const passwordSelector = 'input[placeholder="סיסמה"]';
    
    try {
      await page.waitForSelector(passwordSelector, { visible: true, timeout: 10000 });
      console.log('   ✅ Password field found');
      
      // Clear field first
      await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        if (element) element.value = '';
      }, passwordSelector);
      
      console.log('   📝 Filling password field...');
      await page.focus(passwordSelector);
      await page.type(passwordSelector, credentials.password, { delay: 100 });
      
      // Check if it worked (don't log actual password)
      const passwordFilled = await page.evaluate((selector) => {
        const element = document.querySelector(selector);
        return element ? element.value.length > 0 : false;
      }, passwordSelector);
      console.log(`   Password field filled: ${passwordFilled}`);
      
    } catch (error) {
      console.error('   ❌ Error finding password field:', error.message);
    }
    
    console.log('🔍 Step 4: Look for submit button...');
    const submitSelector = 'button[type="submit"]';
    
    try {
      await page.waitForSelector(submitSelector, { visible: true, timeout: 10000 });
      console.log('   ✅ Submit button found');
      console.log('   ⏳ Waiting 5 seconds before you can manually click submit to test...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      
    } catch (error) {
      console.error('   ❌ Error finding submit button:', error.message);
    }
    
    console.log('⏳ Waiting 20 seconds for manual inspection...');
    console.log('   👆 You can manually click the submit button to test if fields are filled');
    await new Promise(resolve => setTimeout(resolve, 20000));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'debug-error.png', fullPage: true });
  }
  
  await browser.close();
  console.log('🔚 Fill debug complete');
}

debugFillFields().catch(console.error);