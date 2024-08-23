import * as fs from 'fs';
import { carBrands, type CarBrands } from './src/config/car-brands';

// Interface para definir o formato dos dados no JSON
interface CarData {
    brand: string;
    name: string;
    price: string;
    link: string;
    location: string;
    store: string;
    image: string;
    year: string; // Pode ser string ou número dependendo do JSON
    km: string;
}

// Função para converter o preço de string para número
const convertPriceToNumber = (price: string): number => {
    // Remove os pontos de separação de milhar e substitui a vírgula decimal por um ponto
    const normalizedPrice = price.replace(/[^\d,-]/g, '').replace('.', '').replace(',', '.');
    return parseFloat(normalizedPrice);
}

// Função para calcular o preço máximo, médio e mínimo
const calculatePriceStats = (prices: number[]): { max: number, min: number, avg: number } => {
    const validPrices = prices.filter(price => !isNaN(price));
    const max = Math.max(...validPrices);
    const min = Math.min(...validPrices);
    const avg = validPrices.reduce((sum, price) => sum + price, 0) / validPrices.length;
    return { max, min, avg };
}

// Função para formatar números com pontos e vírgulas e limitar a 2 casas decimais
const formatNumber = (num: number): string => {
    return num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Função para filtrar os dados dos carros excluindo aqueles que possuem nomes que incluem alguma das palavras no array de exclusão.
const filterCarDataByExclusionWords = (carData: CarData[], exclusionWords: string[]): CarData[] => {
    return carData.filter(car => {
        return !exclusionWords.some(word => car.name.toLowerCase().includes(word.toLowerCase()));
    });
}

// Função para garantir que car.name não tenha duas marcas ao mesmo tempo
const filterCarDataByMultipleBrands = (carData: CarData[], brands: CarBrands): CarData[] => {
    const brandNames = Object.keys(brands);
    return carData.filter(car => {
        const brandCount = brandNames.reduce((count, brand) => {
            return car.name.toLowerCase().includes(brand.toLowerCase()) ? count + 1 : count;
        }, 0);
        return brandCount <= 1;
    });
}

// Função para excluir entradas que contenham apenas o nome da marca e o ano
const filterCarDataByBrandAndYearOnly = (carData: CarData[], brands: CarBrands): CarData[] => {
    const brandNames = Object.keys(brands);
    return carData.filter(car => {
        const yearPattern = /\b(19[0-9]{2}|2[0-4][0-9]{2}|2500)\b/;
        const hasYear = yearPattern.test(car.name);
        const hasOnlyBrandAndYear = brandNames.some(brand => {
            const regex = new RegExp(`\\b${brand}\\b`, 'i');
            return hasYear && regex.test(car.name) && car.name.match(regex)?.length === 1 && car.name.split(' ').length === 2;
        });
        return !hasOnlyBrandAndYear;
    });
}

// Função para ler o arquivo JSON e filtrar os dados
const filterCarData = (filePath: string, exclusionWords: string[]): void => {
    console.time('Total Execution Time');
    fs.readFile(filePath, 'utf-8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o arquivo:', err);
            return;
        }

        try {
            const carData: CarData[] = JSON.parse(data);

            const filteredData = carData.filter(car =>
                car.name.toLowerCase().includes(''.toLowerCase()) &&
                convertPriceToNumber(car.price) > 0 &&
                convertPriceToNumber(car.price) < 3000000
            );

            // Aplica o filtro de exclusão de palavras
            const dataAfterExclusion = filterCarDataByExclusionWords(filteredData, exclusionWords);

            // Aplica o filtro de múltiplas marcas
            const dataAfterMultipleBrands = filterCarDataByMultipleBrands(dataAfterExclusion, carBrands);

            // Aplica o filtro de marca e ano apenas
            const finalFilteredData = filterCarDataByBrandAndYearOnly(dataAfterMultipleBrands, carBrands);

            const prices = finalFilteredData.map(car => convertPriceToNumber(car.price));
            const { max, min, avg } = calculatePriceStats(prices);

            // Encontrar o carro mais barato e o mais caro
            const cheapestCar = finalFilteredData.find(car => convertPriceToNumber(car.price) === min);
            const mostExpensiveCar = finalFilteredData.find(car => convertPriceToNumber(car.price) === max);

            console.log('Quantidade de dados:', finalFilteredData.length);
            console.log('Preço Máximo:', formatNumber(max));
            console.log('Preço Mínimo:', formatNumber(min));
            console.log('Preço Médio:', formatNumber(avg));

            if (cheapestCar) {
                console.log('Carro Mais Barato:', cheapestCar);
            }

            if (mostExpensiveCar) {
                console.log('Carro Mais Caro:', mostExpensiveCar);
            }

            console.timeEnd('Total Execution Time');

        } catch (parseErr) {
            console.error('Erro ao analisar o JSON:', parseErr);
        }
    });
};

// Caminho do arquivo JSON
const filePath = './outputTesteCarros4.json';

// Exemplo de palavras a serem excluídas
const exclusionWords: string[] = ['miniatura', 'autorama', 'blocos', 'lego', 'reator', 'sucata', 'parachoque', 'óculos', 'vulcano', 'peças', 'peça', 'pecas', 'peca', 'casaco', 'vendo', 'automotivo', 'automotivos', 'jogo', 'roda', 'rodas', 'sapato', 'carrinho', 'capo', 'brinquedo', 'lego', 'peujout', 'parcelas', 'parcela', 'compra', 'compro', 'alugo', 'compras', 'comprado', 'atrasada', 'atrasadas', '1956'];

// Chama a função para filtrar os dados
filterCarData(filePath, exclusionWords);