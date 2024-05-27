import { Page } from "puppeteer";

export async function autoScroll(page: Page) {
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
            }, 350);
        });
    });
}