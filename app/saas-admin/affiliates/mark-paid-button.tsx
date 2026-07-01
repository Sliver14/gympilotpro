'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

export default function MarkPaidButton({ id }: { id: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleMarkPaid = async () => {
    if (!confirm('Are you sure you want to mark this commission as paid?')) {
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/commissions/${id}/pay`, {
        method: 'POST'
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to update commission')
      }

      router.refresh()
    } catch (err: any) {
      alert(err.message || 'Error marking commission as paid')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleMarkPaid}
      disabled={loading}
      className="bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20 text-xs font-bold px-3 py-1.5 h-auto rounded-none uppercase tracking-wider"
    >
      {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Mark Paid'}
    </Button>
  )
}
