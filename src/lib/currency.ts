// Currency conversion utilities using ExchangeRate-API v4
// Free tier: 1500 requests/month, no API key required for basic usage

interface ExchangeRates {
  [key: string]: number
}

interface ExchangeRateResponse {
  result: string
  documentation: string
  terms_of_use: string
  time_last_update_unix: number
  time_last_update_utc: string
  time_next_update_unix: number
  time_next_update_utc: string
  base_code: string
  target_code: string
  conversion_rate: number
}

// Cache for exchange rates to avoid excessive API calls
const exchangeRateCache = new Map<string, { rate: number; timestamp: number }>()
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

/**
 * Get exchange rate from source currency to GBP
 * Uses ExchangeRate-API v4 (free tier: 1500 requests/month)
 */
export async function getExchangeRateToGBP(sourceCurrency: string): Promise<number> {
  // If already GBP, return 1
  if (sourceCurrency === 'GBP') {
    return 1
  }

  const cacheKey = `${sourceCurrency}_GBP`
  const cached = exchangeRateCache.get(cacheKey)
  
  // Check if we have a valid cached rate
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.rate
  }

  try {
    // Use a more reliable free API endpoint
    const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${sourceCurrency}`)
    
    if (!response.ok) {
      throw new Error(`Exchange rate API error: ${response.status}`)
    }

    const data = await response.json()
    
    // Get GBP rate from the rates object
    const rate = data.rates?.GBP
    if (typeof rate !== 'number' || rate <= 0) {
      throw new Error('Invalid exchange rate received')
    }

    console.log(`Fetched exchange rate: 1 ${sourceCurrency} = ${rate} GBP`)

    // Cache the rate
    exchangeRateCache.set(cacheKey, {
      rate,
      timestamp: Date.now()
    })

    return rate
  } catch (error) {
    console.warn(`Failed to fetch exchange rate for ${sourceCurrency}:`, error)
    
    // Fallback rates (approximate, should be updated periodically)
    const fallbackRates: { [key: string]: number } = {
      'EUR': 0.85,
      'USD': 0.79,
      'CHF': 0.88,
      'CAD': 0.58,
      'AUD': 0.52,
      'JPY': 0.0052,
      'SEK': 0.075,
      'NOK': 0.075,
      'DKK': 0.11,
      'PLN': 0.20,
      'CZK': 0.034,
      'HUF': 0.0021
    }

    const fallbackRate = fallbackRates[sourceCurrency] || 1
    console.warn(`Using fallback rate for ${sourceCurrency}: ${fallbackRate}`)
    return fallbackRate
  }
}

/**
 * Convert amount from source currency to GBP
 */
export async function convertToGBP(amount: number, sourceCurrency: string): Promise<number> {
  if (sourceCurrency === 'GBP') {
    return amount
  }

  console.log(`Converting ${amount} ${sourceCurrency} to GBP`)
  const rate = await getExchangeRateToGBP(sourceCurrency)
  const converted = Math.round(amount * rate * 100) / 100 // Round to 2 decimal places
  console.log(`Conversion result: ${amount} ${sourceCurrency} = ${converted} GBP (rate: ${rate})`)
  return converted
}

/**
 * Format currency amount with proper symbol
 */
export function formatCurrency(amount: number, currency: string = 'GBP'): string {
  const symbols: { [key: string]: string } = {
    'GBP': '£',
    'EUR': '€',
    'USD': '$',
    'CHF': 'CHF',
    'CAD': 'C$',
    'AUD': 'A$',
    'JPY': '¥',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr',
    'PLN': 'zł',
    'CZK': 'Kč',
    'HUF': 'Ft'
  }

  const symbol = symbols[currency] || currency
  return `${symbol}${amount.toFixed(2)}`
}

/**
 * Get all supported currencies
 */
export function getSupportedCurrencies(): string[] {
  return [
    'GBP', 'EUR', 'USD', 'CHF', 'CAD', 'AUD', 'JPY', 
    'SEK', 'NOK', 'DKK', 'PLN', 'CZK', 'HUF'
  ]
}
