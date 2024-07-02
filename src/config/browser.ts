import type { PuppeteerLaunchOptions } from "puppeteer";

export const browserConfig: PuppeteerLaunchOptions = {
    headless: false, 
    timeout: 30000000000000, 
    protocolTimeout: 30000000000000
}