import puppeteer, { Page } from 'puppeteer';

async function autoScroll(page: Page) {
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
            }, 250);
        });
    });
}

async function run() {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto('https://www.facebook.com/marketplace/111708808846317/search?minPrice=3000&query=corsa&exact=true');
    await page.setViewport({
        width: 2000,
        height: 1000
    });

    const selector = 'div[aria-label="Fechar"]';
    await page.waitForSelector(selector);
    await page.click(selector);

    await autoScroll(page);

    const itemsData = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll('a.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x1heor9g.x1sur9pj.xkrqix3.x1lku1pv'));
        return items.map(item => {
            const price = item.querySelector('div.x78zum5.xdt5ytf.x1n2onr6 > div.x9f619.x78zum5.xdt5ytf.x1qughib.x1rdy4ex.xz9dl7a.xsag5q8.xh8yej3.xp0eagm.x1nrcals > div.x1gslohp.xkh6y0r > span.x78zum5 > div.x78zum5.x1q0g3np.x1iorvi4.x4uap5.xjkvuk6.xkhd6sd > span[dir="auto"]')?.textContent?.trim() ?? 'Preço não informado';
            const name = item.querySelector('div.x78zum5.xdt5ytf.x1n2onr6 > div.x9f619.x78zum5.xdt5ytf.x1qughib.x1rdy4ex.xz9dl7a.xsag5q8.xh8yej3.xp0eagm.x1nrcals > div.x1gslohp.xkh6y0r > span[aria-hidden="true"]')?.textContent?.trim() ?? 'Nome não informado';
            const location = item.querySelector('div.x78zum5.xdt5ytf.x1n2onr6 > div.x9f619.x78zum5.xdt5ytf.x1qughib.x1rdy4ex.xz9dl7a.xsag5q8.xh8yej3.xp0eagm.x1nrcals > div.x1gslohp.xkh6y0r > span[aria-hidden="true"] > div.x1iorvi4.x4uap5.xjkvuk6.xkhd6sd > span[dir="auto"] > span.x1lliihq.x6ikm8r.x10wlt62.x1n2onr6.xlyipyv.xuxw1ft.x1j85h84')?.textContent?.trim() ?? 'Localização não informada'
            const link = item.getAttribute('href') ?? 'Link não informado';
            const formatedLink = `https://www.facebook.com${link}`
            return { price, name, location, formatedLink };
        });
    });

    console.log(itemsData)
    
    await browser.close();
}

await run();
