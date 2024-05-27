import puppeteer from 'puppeteer';
import { execMarketplace } from './marketplace';
import fs from 'fs';
import { execMottaAutomoveis } from './motta-automoveis';

async function run() {
    console.time('Total Execution Time');

    const cars = [
        "",
    ];

    const browser = await puppeteer.launch({ headless: false, timeout: 30000000000000, protocolTimeout: 30000000000000, })
    const resultsMarketplace = []

    try {
        for (const car of cars) {
            const result = await execMarketplace({
                car_query: car,
                min_price: '5000',
                browser: browser
            });
            resultsMarketplace.push(result)
        }

        const data = {
            marketplace: resultsMarketplace
        }

        const jsonData = JSON.stringify(data, null, 2)

        fs.writeFileSync('output.json', jsonData, 'utf8')
        console.log('Dados salvos em output.json')

    } catch (error) {
        console.error('Erro ao executar a função run:', error)
    } finally {
        await browser.close()
        console.timeEnd('Total Execution Time')
    }
}

await run();