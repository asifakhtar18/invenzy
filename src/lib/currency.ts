export const currencyRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 150.25,
  CAD: 1.36,
  AUD: 1.52,
  CNY: 7.23,
  INR: 83.45,
  MXN: 16.82,
  BRL: 5.07,
}

export type CurrencyCode = keyof typeof currencyRates

export const currencySymbols: Record<CurrencyCode, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
  JPY: "¥",
  CAD: "C$",
  AUD: "A$",
  CNY: "¥",
  INR: "₹",
  MXN: "$",
  BRL: "R$",
}

export const currencyNames: Record<CurrencyCode, string> = {
  USD: "US Dollar",
  EUR: "Euro",
  GBP: "British Pound",
  JPY: "Japanese Yen",
  CAD: "Canadian Dollar",
  AUD: "Australian Dollar",
  CNY: "Chinese Yuan",
  INR: "Indian Rupee",
  MXN: "Mexican Peso",
  BRL: "Brazilian Real",
}

// Map country codes to default currencies
export const countryCurrencyMap: Record<string, CurrencyCode> = {
  US: "USD",
  CA: "CAD",
  GB: "GBP",
  EU: "EUR", // Not a country code, but used for European countries
  DE: "EUR",
  FR: "EUR",
  IT: "EUR",
  ES: "EUR",
  JP: "JPY",
  CN: "CNY",
  IN: "INR",
  AU: "AUD",
  MX: "MXN",
  BR: "BRL",
}

// European countries that use EUR
const euroCountries = [
  "AT",
  "BE",
  "CY",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PT",
  "SK",
  "SI",
  "ES",
]

export function getDefaultCurrencyForCountry(countryCode: string): CurrencyCode {
  if (euroCountries.includes(countryCode)) {
    return "EUR"
  }

  return countryCurrencyMap[countryCode] || "USD"
}

export function formatCurrency(amount: number, currencyCode: CurrencyCode): string {
  const convertedAmount = (amount * currencyRates.USD) / currencyRates[currencyCode]

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(convertedAmount)
}

