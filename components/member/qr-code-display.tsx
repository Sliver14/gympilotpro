'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { QrCode, Download, Loader2 } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

interface QRCodeDisplayProps {
  memberId: string
}

export default function QRCodeDisplay({ memberId }: QRCodeDisplayProps) {
  const [qrCode, setQrCode] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchQRCode = async () => {
      try {
        const response = await fetch(`/api/members/${memberId}/qr-code`)
        const data = await response.json()
        setQrCode(data.qrCode)
      } catch (error) {
        console.error('Error fetching QR code:', error)
        toast({
          title: 'Error',
          description: 'Failed to load QR code',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchQRCode()
  }, [memberId, toast])

  const handleDownload = () => {
    if (!qrCode) return

    const link = document.createElement('a')
    link.href = qrCode
    link.download = `klimarx-qr-${memberId}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    toast({
      title: 'Downloaded',
      description: 'QR code downloaded successfully',
    })
  }

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-[2rem] p-20 flex justify-center shadow-2xl">
        <Loader2 className="h-8 w-8 animate-spin text-[#daa857]" />
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-[2rem] p-4 md:p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#daa857]/5 blur-[80px]" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-12 pb-4 border-b border-border">
          <h3 className="text-xl font-black uppercase tracking-tighter text-foreground flex items-center gap-3">
            <QrCode className="h-5 w-5 text-[#daa857]" /> Access <span className="text-[#daa857]">Pass</span>
          </h3>
          <p className="text-[10px] font-black text-muted-foreground">Access Authenticator</p>
        </div>

        <div className="flex flex-col items-center gap-4 md:gap-6 md:gap-10">
          {qrCode && (
            <>
              <div className="relative p-4 md:p-8 rounded-[2.5rem] bg-white shadow-[0_0_50px_rgba(218,168,87,0.15)] group transition-all duration-500 hover:scale-[1.02]">
                <div className="absolute inset-0 border-2 border-[#daa857]/20 rounded-[2.5rem] scale-105 group-hover:scale-110 transition-transform duration-500" />
                <img src={qrCode} alt="Member QR Code" className="h-64 w-64 relative z-10" />
              </div>
              
              <div className="text-center max-w-sm">
                <p className="mb-8 text-xs font-bold text-muted-foreground leading-relaxed">
                  Present this <span className="text-[#daa857]">QR Code</span> at the check-in terminal for instant gym access.
                </p>
                <Button 
                  onClick={handleDownload} 
                  className="w-full h-14 bg-[#daa857] hover:bg-[#cdb48b] text-black font-black rounded-xl transition-all shadow-xl shadow-[#daa857]/10 flex items-center justify-center gap-3"
                >
                  <Download className="h-5 w-5" />
                  Download QR Code
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
