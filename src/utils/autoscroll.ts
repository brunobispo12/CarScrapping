import { Page } from "puppeteer";
import { logger } from "./logger";

export async function AutoScroll(page: Page) {
    logger('start', 'AutoScrolling')
    await page.evaluate(async () => {
        await new Promise<void>((resolve) => {
            let totalHeight = -1000;
            let distance = 150;
            let timer = setInterval(() => {
                let scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight - window.innerHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 700);
        });
    });
    logger('success', 'AutoScrolling successfully')
}