import type { AdvertisementDTO } from "./AdvertisementDTO"

export type StoreTransferDTO = {
    store: string
    carName?: string
    data: AdvertisementDTO[]
    createdAt: string
}