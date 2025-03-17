"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { type CurrencyCode, getDefaultCurrencyForCountry } from "@/lib/currency"

type CurrencyContextType = {
  currency: CurrencyCode
  setCurrency: (currency: CurrencyCode) => void
  isLoading: boolean
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<CurrencyCode>("USD")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Try to get currency from localStorage first
    const savedCurrency = localStorage.getItem("preferredCurrency") as CurrencyCode | null

    if (savedCurrency && Object.keys(getDefaultCurrencyForCountry).includes(savedCurrency)) {
      setCurrency(savedCurrency)
      setIsLoading(false)
      return
    }

    // If no saved preference, try to detect location
    const detectLocation = async () => {
      try {
        const response = await fetch("https://ipapi.co/json/")
        const data = await response.json()

        if (data.country) {
          const detectedCurrency = getDefaultCurrencyForCountry(data.country)
          setCurrency(detectedCurrency)
          localStorage.setItem("preferredCurrency", detectedCurrency)
        }
      } catch (error) {
        console.error("Failed to detect location:", error)
        // Fallback to USD
        setCurrency("USD")
      } finally {
        setIsLoading(false)
      }
    }

    detectLocation()
  }, [])

  const handleSetCurrency = (newCurrency: CurrencyCode) => {
    setCurrency(newCurrency)
    localStorage.setItem("preferredCurrency", newCurrency)
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, isLoading }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)

  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider")
  }

  return context
}

