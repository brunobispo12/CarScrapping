import type { Page } from "puppeteer";
import { generateRandomUA } from "./random-ua-generator";
import { logger } from "./logger";

export async function ConfigurePage(page: Page) {

    logger('start', "Setting User Agent");
    await page.setUserAgent(generateRandomUA());
    logger('success', "Setted User Agent");

    return page;
}