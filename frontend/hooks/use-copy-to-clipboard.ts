"use client"

import { useState } from 'react'
import { useToast } from '@/hooks/use-toast'

export function useCopyToClipboard() {
  const [isCopied, setIsCopied] = useState(false)
  const { toast } = useToast()

  const copyToClipboard = async (text: string, successMessage?: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setIsCopied(true)
      
      toast({
        title: "Copied!",
        description: successMessage || `"${text}" copied to clipboard`,
        variant: "success",
      })

      setTimeout(() => setIsCopied(false), 2000)
      return true
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy manually",
        variant: "destructive",
      })
      return false
    }
  }

  return { copyToClipboard, isCopied }
}
