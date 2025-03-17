"use client"

import { useCurrency } from "@/contexts/currency-context"
import { formatCurrency } from "@/lib/currency"

interface PriceDisplayProps {
  amount: number
  className?: string
}

export function PriceDisplay({ amount, className }: PriceDisplayProps) {
  const { currency, isLoading } = useCurrency()

  if (isLoading) {
    return <span className={className}>Loading...</span>
  }

  return <span className={className}>{formatCurrency(amount, currency)}</span>
}

