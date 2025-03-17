"use client"

import { Check, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"
import { useCurrency } from "@/contexts/currency-context"
import { type CurrencyCode, currencyNames, currencySymbols } from "@/lib/currency"

export function CurrencySelector() {
  const [open, setOpen] = useState(false)
  const { currency, setCurrency } = useCurrency()
  const [filteredCurrencies, setFilteredCurrencies] = useState<{ value: CurrencyCode; label: string }[]>([])

  const currencies = Object.entries(currencyNames).map(([code, name]) => ({
    value: code as CurrencyCode,
    label: `${currencySymbols[code as CurrencyCode]} ${name} (${code})`,
  }))

  useEffect(() => {
    setFilteredCurrencies(currencies)
  }, [])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
          {currency ? currencies.find((c) => c.value === currency)?.label : "Select currency..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <div className="border rounded-md">
          <input
            type="text"
            placeholder="Search currency..."
            className="w-full px-3 py-2 border-b"
            onChange={(e) => {
              const searchTerm = e.target.value.toLowerCase();
              const filtered = currencies.filter(c =>
                c.label.toLowerCase().includes(searchTerm)
              );
              setFilteredCurrencies(filtered);
            }}
          />
          <div className="max-h-[300px] overflow-y-auto">
            <div className="p-2 text-sm text-gray-500">Currencies</div>
            {filteredCurrencies.map((c) => (
              <button
                key={c.value}
                className="w-full px-3 py-2 text-left flex items-center hover:bg-gray-100"
                onClick={() => {
                  setCurrency(c.value);
                  setOpen(false);
                }}
              >
                <span className={cn(
                  "mr-2 inline-block",
                  currency === c.value ? "visible" : "invisible"
                )}>✓</span>
                {c.label}
              </button>
            ))}
          </div>
        </div>
        <button onClick={() => setOpen(false)}>Close</button>
      </PopoverContent>
    </Popover>
  )
}

