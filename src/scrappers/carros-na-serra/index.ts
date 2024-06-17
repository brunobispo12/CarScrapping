import chalk from "chalk";
import logUpdate from "log-update";
import type { Browser } from "puppeteer";
import { autoScroll } from "../../utils/autoscroll";
import { generateRandomUA } from "../../utils/random-ua-generator";

export async function execCarrosNaSerra(browser: Browser) {
    logUpdate(chalk.yellow("[0/?] Starting execCarrosNaSerra"));

    logUpdate(chalk.yellow("[1/?] Creating browser page"));
    const page = await browser.newPage();
    logUpdate(chalk.green("[1/?] Page was created"));

    logUpdate(chalk.yellow("[2/?] Setting User Agent and Navigation timeout"));
    page.setDefaultNavigationTimeout(60000);
    await page.setUserAgent(generateRandomUA());
    logUpdate(chalk.green("[2/?] Setted User Agent and Navigation timeout"));

    logUpdate(chalk.green("[3/?] Entering https://www.carrosnaserra.com.br"));
    await page.goto("https://www.carrosnaserra.com.br/capa", { waitUntil: 'networkidle2' });
    logUpdate(chalk.green("[3/?] Entered https://www.carrosnaserra.com.br"));

    logUpdate(chalk.green("[4/?] Closing 'fechar' section"));
    await page.waitForSelector(".fechar");
    await page.click(".fechar");
    logUpdate(chalk.green("[4/?] Closed 'fechar' section"));

    logUpdate(chalk.green("[5/?] appling search filters"));
    await page.select('select[name="categoria"]', 'CARROS');
    await page.type('input[name="de"]', '5.000');
    await page.type('input[name="ate"]', '100.000');
    await page.select('select[name="regiao"]', 'ALTOS DA SERRA');
    logUpdate(chalk.green("[5/?] Applied search filters"));

    await autoScroll(page);

    logUpdate(chalk.blue("[Completed] Finished execution of execCarrosNaSerra"))
    logUpdate.done();

    return
}

