import chalk from "chalk";
import logUpdate from "log-update";
import type { Browser } from "puppeteer";
import { logger } from "../../utils/logger";
import { generateRandomUA } from "../../utils/random-ua-generator";
import type { AdvertisementDTO } from "../../entities/AdvertisementDTO";

export async function execCarrosNaSerra(browser: Browser): Promise<AdvertisementDTO[]> {
    logUpdate(chalk.yellow("[0/?] Starting execCarrosNaSerra"));

    const page = await browser.newPage();
    await page.setUserAgent(generateRandomUA());

    logger('start', '[3/?] Entering https://www.carrosnaserra.com.br');
    await page.goto("https://www.carrosnaserra.com.br/capa", { waitUntil: 'networkidle2' });
    logger('success', '[3/?] Entered https://www.carrosnaserra.com.br');

    const categorias = ['CARROS'];
    const intervalos = [
        { min: 3000, max: 10000 },
        // Descomente os intervalos conforme necessário
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
        { min: 200000, max: 10000000 }
    ];

    const result: AdvertisementDTO[] = [];

    for (const categoria of categorias) {
        for (const intervalo of intervalos) {
            logger('info', `[?/?] Searching ${categoria} from R$ ${intervalo.min} to R$ ${intervalo.max}`);

            await page.select('select[name="categoria"]', categoria);

            await page.$eval('input[name="de"]', el => el.value = '');
            await page.$eval('input[name="ate"]', el => el.value = '');
            await page.type('input[name="de"]', intervalo.min.toString(), { delay: 100 });
            await page.type('input[name="ate"]', intervalo.max.toString(), { delay: 100 });

            await Promise.all([
                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 0 }),
                page.click('.btbuscar')
            ]);

            do {
                const anuncios = await page.evaluate(() => {
                    const items = Array.from(document.querySelectorAll("a > div.estoque-card"));
                    return items.map(item => {
                        const name = item.querySelector("div.modelo-estoque-card")?.textContent?.trim() ?? 'Nome não informado';
                        const brand = item.querySelector("div.ano-card")?.textContent?.trim() ?? 'Marca não informada';

                        const yearKmText = item.querySelector("div.ano-cor-km-card")?.textContent?.trim() ?? 'Ano e quilometragem não informados';
                        const [kmText, yearText] = yearKmText.split('\n').map(text => text.trim());
                        const km = kmText.includes('km não informado') ? 'Quilometragem não informada' : kmText;
                        let year = yearText ?? 'Ano não informado';
                        if (year.endsWith('-')) {
                            year = year.slice(0, -1).trim();
                        }

                        const price = item.querySelector("div.preco-estoque-card")?.textContent?.trim() ?? 'Preço não informado';
                        const linkElement = item.closest('a');
                        let link = (linkElement ? linkElement.getAttribute('href') : '') ?? "Link não encontrado";
                        if (link.startsWith('..')) {
                            link = link.replace('..', '');
                        }
                        const fullLink = "https://www.carrosnaserra.com.br" + link;
                        let location = link.split('/')[1] ?? 'Localização não informada';
                        location = location.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
                        const image = item.querySelector("div.box-img-card > img")?.getAttribute('src') ?? 'Imagem não informada';
                        const store = "Carros na Serra";
                        return { brand: brand, name: `${brand} ${name}`, price, link: fullLink, location, store, image, year, km };
                    });
                });

                console.log(anuncios);

                result.push(...anuncios);

                logger('success', `[?/?] Found ${anuncios.length} ads in range R$ ${intervalo.min} to R$ ${intervalo.max}`);

                // Aguardar brevemente para o link 'Próxima' tornar-se clicável, se existir
                const nextAvailable = await page.evaluate(() => {
                    const nextLink = Array.from(document.querySelectorAll('a')).find(el => el.textContent?.includes('Próxima'));
                    if (nextLink) {
                        nextLink.click();
                        return true;
                    }
                    return false;
                });

                if (nextAvailable) {
                    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 0 });
                } else {
                    break; // Sai do loop se não houver mais páginas
                }
            } while (true); // Loop infinito, sai apenas pelo 'break'
        }
    }

    logger('done', 'execCarrosNaSerra finished successfully');
    console.log(result);

    return result;
}
