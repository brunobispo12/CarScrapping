import puppeteer, { Browser } from 'puppeteer';
import fs from 'fs';
import { browserConfig } from './config/browser';
import { execMarketplace, type MarketplaceConfig } from './scrappers/marketplace';
import { carBrands } from './config/car-brands';
import type { AdvertisementDTO } from './entities/AdvertisementDTO';
import { execCarrosNaSerra } from './scrappers/carros-na-serra';
import execOlx from './scrappers/olx';

async function run(): Promise<void> {
    console.time('Total Execution Time');

    const browser: Browser = await puppeteer.launch(browserConfig);
    const allResults: AdvertisementDTO[] = [];

    try {

        const olx = await execOlx(browser)
        allResults.push(...olx)

        const jsonData = JSON.stringify(allResults, null, 2);
        fs.writeFileSync('outputTesteCarros4.json', jsonData, 'utf8');

    } catch (error) {
        console.error('Erro ao executar a função run:', error);
    } finally {
        await browser.close();
        console.timeEnd('Total Execution Time');
    }
}

run();
