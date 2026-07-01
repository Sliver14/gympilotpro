'use client'

import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <Button
      onClick={handleCopy}
      className="h-12 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase text-xs rounded-none gap-2 flex items-center justify-center px-6"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4" /> Copied!
        </>
      ) : (
        <>
          <Copy className="w-4 h-4" /> Copy Link
        </>
      )}
    </Button>
  )
}
