export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  interval: "year"
}

export const PRODUCTS: Product[] = [
  {
    id: "break-annual",
    name: "Break PRO — Annual",
    description: "Full access to Break PRO for iOS, renewed yearly.",
    priceInCents: 4999,
    interval: "year",
  },
]

export const ANNUAL_PLAN = PRODUCTS[0]
