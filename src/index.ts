import puppeteer, { Browser } from 'puppeteer';
import { leumi } from './scrapers/leumi';
import { LeumiCredentials, LeumiOptions, LeumiScraperMethods } from './types';

export interface InitOptions {
  headless?: boolean;
  userAgent?: string;
  executablePath?: string;
  args?: string[];
}

export interface ScraperInstance {
  leumi: (credentials: LeumiCredentials, options?: LeumiOptions) => Promise<LeumiScraperMethods>;
  close: () => Promise<void>;
}

export async function init(options: InitOptions = {}): Promise<ScraperInstance> {
  const browser = await puppeteer.launch({
    headless: options.headless !== false, // default to headless unless explicitly set to false
    executablePath: options.executablePath,
    args: options.args || [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--disable-gpu'
    ]
  });

  const newPage = async () => {
    const page = await browser.newPage();
    
    // Set user agent if provided
    if (options.userAgent) {
      await page.setUserAgent(options.userAgent);
    }
    
    // Set viewport
    await page.setViewport({ width: 1280, height: 720 });
    
    return page;
  };

  return {
    leumi: async (credentials: LeumiCredentials, options?: LeumiOptions) => {
      const page = await newPage();
      return leumi(page, credentials, options);
    },
    close: async () => {
      await browser.close();
    }
  };
}

// Re-export types for convenience
export * from './types';
export { leumi };

// Default export for backwards compatibility
export default { init };