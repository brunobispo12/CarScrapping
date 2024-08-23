import { Browser } from "puppeteer";
import { AutoScroll } from "../../utils/autoscroll";
import type { AdvertisementDTO } from "../../entities/AdvertisementDTO";
import { getCurrentDateTime } from "../../utils/get-current-date-time";

export type MarketplaceConfig = {
    car_query: string
    min_price: string
    browser: Browser
    brand: string
}

export async function execMarketplace({ car_query, min_price, browser, brand }: MarketplaceConfig): Promise<AdvertisementDTO[]> {
    const baseURL = 'https://pt-br.facebook.com/'

    const page = await browser.newPage();
    await page.goto(`https://www.facebook.com/marketplace/111708808846317/search?minPrice=${min_price}&query=${car_query}&exact=true`, { waitUntil: 'networkidle0' });
    await page.setViewport({
        width: 2000,
        height: 3000
    });

    const selector = 'div[aria-label="Fechar"]';
    await page.waitForSelector(selector);
    await page.click(selector);

    await AutoScroll(page);

    const currentDateTime = getCurrentDateTime();

    const itemsData: AdvertisementDTO[] = await page.evaluate(({ brand, baseURL, currentDateTime }) => {
        const items = Array.from(document.querySelectorAll('a.x1i10hfl.xjbqb8w.x1ejq31n.xd10rxx.x1sy0etr.x17r0tee.x972fbf.xcfux6l.x1qhh985.xm0m39n.x9f619.x1ypdohk.xt0psk2.xe8uvvx.xdj266r.x11i5rnm.xat24cr.x1mh8g0r.xexx8yu.x4uap5.x18d9i69.xkhd6sd.x16tdsg8.x1hl2dhg.xggy1nq.x1a2a7pz.x1heor9g.x1sur9pj.xkrqix3.x1lku1pv'));
        return items.map(item => {
            const price = item.querySelector('div.x78zum5.xdt5ytf.x1n2onr6 > div.x9f619.x78zum5.xdt5ytf.x1qughib.x1rdy4ex.xz9dl7a.xsag5q8.xh8yej3.xp0eagm.x1nrcals > div.x1gslohp.xkh6y0r > span.x78zum5 > div.x78zum5.x1q0g3np.x1iorvi4.x4uap5.xjkvuk6.xkhd6sd > span[dir="auto"]')?.textContent?.trim() ?? 'Preço não informado';
            const name = item.querySelector('div.x78zum5.xdt5ytf.x1n2onr6 > div.x9f619.x78zum5.xdt5ytf.x1qughib.x1rdy4ex.xz9dl7a.xsag5q8.xh8yej3.xp0eagm.x1nrcals > div.x1gslohp.xkh6y0r > span[aria-hidden="true"]')?.textContent?.trim() ?? 'Nome não informado';
            const yearRegex = /\b(19[0-9]{2}|20[0-2][0-9]|202[0-4])\b/g;
            const found = name.match(yearRegex);
            const year = found ? found[0] : "Ano não encontrado";
            const location = item.querySelector('div.x78zum5.xdt5ytf.x1n2onr6 > div.x9f619.x78zum5.xdt5ytf.x1qughib.x1rdy4ex.xz9dl7a.xsag5q8.xh8yej3.xp0eagm.x1nrcals > div.x1gslohp.xkh6y0r > span[aria-hidden="true"] > div.x1iorvi4.x4uap5.xjkvuk6.xkhd6sd > span[dir="auto"] > span.x1lliihq.x6ikm8r.x10wlt62.x1n2onr6.xlyipyv.xuxw1ft.x1j85h84')?.textContent?.trim() ?? 'Localização não informada'
            const baselink = item.getAttribute('href') ?? 'Link não informado';
            const image = item.querySelector("div.x78zum5.xdt5ytf.x1n2onr6 > div.x1n2onr6 > div.x1n2onr6.xh8yej3 > div.x1exxf4d.x1y71gwh.x1nb4dca.xu1343h.xhk9q7s.x1otrzb0.x1i1ezom.x1o6z2jb.x13fuv20.xu3j5b3.x1q0q8m5.x26u7qi.x178xt8z.xm81vs4.xso031l.xy80clv.x1ey2m1c.xds687c.x6ikm8r.x10wlt62.x1n2onr6.x17qophe.x13vifvy > div.xhk9q7s.x1otrzb0.x1i1ezom.x1o6z2jb.x6ikm8r.x10wlt62.x1vrad04.x1n2onr6.xh8yej3 > div.x78zum5.x1a02dak.x1c0ccdx.x10l6tqk.xzadtn0.x1pdr0v7.x9s46ru > div.x9f619.x78zum5.x1iyjqo2.x5yr21d.x4p5aij.x19um543.x1j85h84.x1m6msm.x1n2onr6.xh8yej3 > img ")?.getAttribute('src') ?? 'Imagem não encontrada'
            const link = baseURL + baselink
            const store = "Marketplace"
            // Encontrando a quilometragem baseada no conteúdo 'km'
            const kmSpan = Array.from(item.querySelectorAll('span.x1lliihq.x6ikm8r.x10wlt62.x1n2onr6.xlyipyv.xuxw1ft.x1j85h84'))
                .find(span => span.textContent?.includes('km'));
            const km = kmSpan?.textContent?.trim() ?? 'Quilometragem não informada';
            return { price, name, location, link, store, image, year, km, brand, createdAt: currentDateTime };
        });
    }, { brand, baseURL, currentDateTime });

    await page.close();

    return itemsData;
}
