import chalk from "chalk";
import logUpdate from "log-update";
import type { Browser } from "puppeteer";
import { logger } from "../../utils/logger";
import { generateRandomUA } from "../../utils/random-ua-generator";
import type { AdvertisementDTO } from "../../entities/AdvertisementDTO";
import { getCurrentDateTime } from "../../utils/get-current-date-time";

const priceRanges = [
    { min: 3000, max: 10000 },
    { min: 10000, max: 20000 },
    { min: 20000, max: 30000 },
    { min: 30000, max: 40000 },
    { min: 40000, max: 50000 },
    { min: 50000, max: 60000 },
    { min: 60000, max: 70000 },
    { min: 70000, max: 80000 },
    { min: 80000, max: 90000 },
    { min: 90000, max: 100000 },
    { min: 100000, max: 150000 },
    { min: 150000, max: 200000 },
    { min: 200000, max: 9999999 }
];

async function processPriceRange(browser: Browser, range: { min: number, max: number }): Promise<AdvertisementDTO[]> {
    const baseUrl = "https://www.olx.com.br";
    let url = `${baseUrl}/autos-e-pecas/carros-vans-e-utilitarios/estado-rs?ps=${range.min}&pe=${range.max}&ctp=5&ctp=8&ctp=3&ctp=9&ctp=2`;
    const result: AdvertisementDTO[] = [];

    const page = await browser.newPage();
    await page.setUserAgent(generateRandomUA());
    await page.setViewport({
        width: 1920,
        height: 1080
    });

    const currentDateTime = getCurrentDateTime();
    let currentPage = 1;

    do {
        logger('start', `[${currentPage}/5] Entering ${url} for range R$ ${range.min} to R$ ${range.max}`);
        await page.goto(url, { waitUntil: 'networkidle2' });
        logger('success', `[${currentPage}/5] Entered ${url} for range R$ ${range.min} to R$ ${range.max}`);

        await page.waitForSelector('[data-ds-component="DS-AdCard"]', { timeout: 10000 }).catch(() => {
            logger('error', `No ads found on ${url}`);
        });

        const itemsData = await page.evaluate(({ currentDateTime }) => {
            const items = Array.from(document.querySelectorAll('[data-ds-component="DS-AdCard"]'));

            return items.map(item => {
                const title = item.querySelector('.olx-ad-card__title')?.textContent?.trim() ?? 'Título não informado';
                const price = item.querySelector('.olx-ad-card__price')?.textContent?.trim() ?? 'Preço não informado';
                const link = item.querySelector('[data-ds-component="DS-NewAdCard-Link"]')?.getAttribute('href') ?? 'Link não informado';
                const location = item.querySelector('.olx-ad-card__location-date-container > p')?.textContent?.trim() ?? "Localização não informada";
                const kilometers = item.querySelector('span[aria-label*="quilômetros rodados"]')?.textContent?.trim() ?? 'Quilometragem não informada';
                const image = item.querySelector('img')?.getAttribute('src') ?? "link da imagem não encontrado";
                const store = "OLX";
                const createdAt = currentDateTime;

                const brand = "Marca não informada";
                const name = title;
                const year = "Ano não informado";
                const km = kilometers;

                return { brand, name, price, link, location, store, image, year, km, createdAt };
            });
        }, { currentDateTime });

        result.push(...itemsData);
        logger('success', `[${currentPage}/5] Found ${itemsData.length} ads on current page for range R$ ${range.min} to R$ ${range.max}`);

        if (currentPage >= 5) {
            logger('info', `Reached page limit of 5 for range R$ ${range.min} to R$ ${range.max}, finishing...`);
            break;
        }

        // Check if the "Próxima página" button exists
        const nextPageButton = await page.$('a.olx-button.olx-button--link-button.olx-button--small.olx-button--a');
        const nextPageUrl = await page.evaluate(() => {
            const nextButton = document.querySelector('a.olx-button.olx-button--link-button.olx-button--small.olx-button--a');
            return nextButton ? nextButton.getAttribute('href') : null;
        });

        if (nextPageButton && nextPageUrl) {
            logger('info', `Next page button found, navigating to the next page...`);
            url = nextPageUrl;
            await Promise.all([
                page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 }) // Navigate to the next page URL
            ]);
            logger('success', `Navigated to the next page.`);
            currentPage++;
        } else {
            logger('info', `No next page button found, finishing...`);
            break;
        }
    } while (currentPage < 5);

    await page.close();

    return result;
}

export default async function execOlx(browser: Browser): Promise<AdvertisementDTO[]> {
    logUpdate(chalk.yellow("[0/5] Starting execOlx"));

    const results = await Promise.all(priceRanges.map(range => processPriceRange(browser, range)));

    const finalResult = results.flat();
    logger('done', 'execOlx finished successfully');
    console.log(finalResult);

    return finalResult;
}