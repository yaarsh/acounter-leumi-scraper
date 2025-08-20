const puppeteer = require('puppeteer');

async function debugLogin() {
  console.log('🚀 Starting login debug test...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true,
    slowMo: 1000 // Very slow to see each action
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('📱 Step 1: Navigate to Leumi homepage...');
    await page.goto('https://www.leumi.co.il/', { waitUntil: 'networkidle2', timeout: 60000 });
    await page.screenshot({ path: 'step1-homepage.png' });
    
    console.log('🔍 Step 2: Find and click login button...');
    const loginSelector = '.enter-account a[originaltitle="כניסה לחשבונך"]';
    await page.waitForSelector(loginSelector, { visible: true, timeout: 30000 });
    
    // Get the login URL
    const loginUrl = await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      return element?.href;
    }, loginSelector);
    console.log(`   Login URL: ${loginUrl}`);
    
    // Navigate to login page directly
    console.log('🚪 Step 3: Navigate to login page...');
    await page.goto(loginUrl);
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 60000 });
    await page.screenshot({ path: 'step3-login-page.png' });
    
    console.log('🔍 Step 4: Look for login form elements...');
    
    // Try multiple username field selectors
    const usernameSelectors = [
      'input[placeholder="שם משתמש"]',
      'input[name="username"]',
      'input[type="text"]',
      '#username',
      '.username-field',
      'input[placeholder*="שם"]'
    ];
    
    let foundUsername = false;
    for (const selector of usernameSelectors) {
      console.log(`   Trying username selector: ${selector}`);
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        console.log(`   ✅ Found ${elements.length} username elements with: ${selector}`);
        foundUsername = true;
        break;
      }
    }
    
    // Try multiple password field selectors  
    const passwordSelectors = [
      'input[placeholder="סיסמה"]',
      'input[name="password"]', 
      'input[type="password"]',
      '#password',
      '.password-field',
      'input[placeholder*="סיסמ"]'
    ];
    
    let foundPassword = false;
    for (const selector of passwordSelectors) {
      console.log(`   Trying password selector: ${selector}`);
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        console.log(`   ✅ Found ${elements.length} password elements with: ${selector}`);
        foundPassword = true;
        break;
      }
    }
    
    // Look for submit button
    const submitSelectors = [
      'button[type="submit"]',
      'input[type="submit"]',
      '.submit-button',
      '.login-submit',
      'button:contains("התחבר")',
      'button:contains("כניסה")'
    ];
    
    let foundSubmit = false;
    for (const selector of submitSelectors) {
      console.log(`   Trying submit selector: ${selector}`);
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        console.log(`   ✅ Found ${elements.length} submit elements with: ${selector}`);
        foundSubmit = true;
        break;
      }
    }
    
    if (!foundUsername || !foundPassword) {
      console.log('❌ Login form not found, getting all inputs:');
      const allInputs = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input'));
        return inputs.map(input => ({
          type: input.type,
          name: input.name,
          id: input.id,
          placeholder: input.placeholder,
          className: input.className
        }));
      });
      console.log('All inputs found:', allInputs);
      
      const allButtons = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        return buttons.map(button => ({
          type: button.type,
          textContent: button.textContent?.trim(),
          className: button.className
        }));
      });
      console.log('All buttons found:', allButtons);
    }
    
    console.log('⏳ Waiting 15 seconds for manual inspection of login page...');
    await new Promise(resolve => setTimeout(resolve, 15000));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'debug-error.png', fullPage: true });
  }
  
  await browser.close();
  console.log('🔚 Login debug complete');
}

debugLogin().catch(console.error);