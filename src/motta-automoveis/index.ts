import type { Browser } from "puppeteer"
import type { AdvertisementDTO } from "../entities/AdvertisementDTO"
import type { StoreTransferDTO } from "../entities/StoreTransferDTO"
import { getCurrentDateTime } from "../utils/get-current-date-time"

export async function execMottaAutomoveis(browser: Browser): Promise<StoreTransferDTO> {
    const page = await browser.newPage()
    await page.goto("https://www.mottaautomoveis.com.br/estoque", { waitUntil: 'networkidle0' })

    const itemsData: AdvertisementDTO[] = await page.evaluate(() => {
        const items = Array.from(document.querySelectorAll("article > a"))
        return items.map(item => {
            const name = item.querySelector("div.media > div.media-body > div.modelo-estoque")?.textContent?.trim() ?? 'Nome não informado';
            const brand = item.querySelector("div.media > div.media-body > div.row > div > div.marca-estoque")?.textContent?.trim() ?? 'Marca não informado';
            const year = item.querySelector("div.media > div.media-body > div.row > div > div.ano-estoque")?.textContent?.trim() ?? 'Ano não informado';
            const price = item.querySelector("div.media > div.media-body > div.row > div > div.preco-estoque")?.textContent?.trim() ?? 'Preço não informado';
            const link = "https://www.mottaautomoveis.com.br/estoque" + item.getAttribute('href') ?? 'Link não informado'
            const image = "https://www.mottaautomoveis.com.br" + item.querySelector("div.media > div.media-heading > img")?.getAttribute('src')
            const location = "Caxias do Sul, RS"
            const store = "Motta Automóveis"
            return { name: `${brand} ${name} ${year}`, price, link, location, store, image }
        })
    })

    return {
        store: 'Motta Automóveis',
        data: itemsData,
        createdAt: getCurrentDateTime()
    }
}