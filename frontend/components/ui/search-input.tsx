"use client"

import { useState, useEffect } from "react"
import { Search, X } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useDebounce } from "@/hooks/use-debounce"
import { cn } from "@/lib/utils"

interface SearchInputProps {
  placeholder?: string
  value?: string
  onSearch: (query: string) => void
  debounceMs?: number
  className?: string
  showClearButton?: boolean
}

export function SearchInput({
  placeholder = "Search...",
  value: controlledValue,
  onSearch,
  debounceMs = 300,
  className,
  showClearButton = true
}: SearchInputProps) {
  const [internalValue, setInternalValue] = useState(controlledValue || "")
  const debouncedValue = useDebounce(internalValue, debounceMs)

  useEffect(() => {
    onSearch(debouncedValue)
  }, [debouncedValue, onSearch])

  useEffect(() => {
    if (controlledValue !== undefined) {
      setInternalValue(controlledValue)
    }
  }, [controlledValue])

  const handleClear = () => {
    setInternalValue("")
    onSearch("")
  }

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder={placeholder}
        value={internalValue}
        onChange={(e) => setInternalValue(e.target.value)}
        className="pl-10 pr-10"
      />
      {showClearButton && internalValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-transparent"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}
