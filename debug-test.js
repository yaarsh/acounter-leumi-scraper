const puppeteer = require('puppeteer');

async function debugTest() {
  console.log('🚀 Starting debug test...');
  
  const browser = await puppeteer.launch({ 
    headless: false,
    devtools: true, // Open dev tools automatically
    slowMo: 500 // Slow down actions to see them
  });
  
  const page = await browser.newPage();
  
  try {
    console.log('📱 Navigating to Leumi homepage...');
    await page.goto('https://www.leumi.co.il/', { waitUntil: 'networkidle2', timeout: 60000 });
    
    console.log('📸 Taking screenshot...');
    await page.screenshot({ path: 'debug-homepage.png', fullPage: true });
    
    console.log('🔍 Looking for login button...');
    
    // Try multiple possible selectors
    const loginSelectors = [
      '.enter-account a[originaltitle="כניסה לחשבונך"]',
      '.enter-account a',
      'a[title*="כניסה"]',
      'a[href*="login"]',
      'a[href*="hb2"]',
      '.login-button',
      '[data-test="login"]'
    ];
    
    let foundLogin = false;
    for (const selector of loginSelectors) {
      console.log(`   Trying selector: ${selector}`);
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        console.log(`   ✅ Found ${elements.length} elements with selector: ${selector}`);
        foundLogin = true;
        
        // Get the href if it's a link
        const href = await page.evaluate((sel) => {
          const el = document.querySelector(sel);
          return el ? el.href : null;
        }, selector);
        console.log(`   Link href: ${href}`);
        break;
      }
    }
    
    if (!foundLogin) {
      console.log('❌ No login button found with any selector');
      console.log('🔍 Getting all links on page:');
      
      const allLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a'));
        return links.map(link => ({
          text: link.textContent?.trim(),
          href: link.href,
          title: link.title,
          className: link.className
        })).filter(link => link.text || link.title).slice(0, 10);
      });
      
      console.log('First 10 links found:', allLinks);
    }
    
    // Wait a bit so you can see the page
    console.log('⏳ Waiting 10 seconds for manual inspection...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    await page.screenshot({ path: 'debug-error.png', fullPage: true });
  }
  
  await browser.close();
  console.log('🔚 Debug test complete');
}

debugTest().catch(console.error);