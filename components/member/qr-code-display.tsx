'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { QrCode, Download } from 'lucide-react'
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
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Spinner className="h-8 w-8 text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <QrCode className="h-5 w-5" />
          Your QR Code
        </CardTitle>
        <CardDescription>Use this code for quick check-ins at the gym</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-6">
        {qrCode && (
          <>
            <div className="rounded-lg border-2 border-border bg-white p-4">
              <img src={qrCode} alt="Member QR Code" className="h-64 w-64" />
            </div>
            <div className="text-center">
              <p className="mb-4 text-sm text-muted-foreground">
                Show this code at the gym entrance for instant check-in
              </p>
              <Button onClick={handleDownload} className="gap-2">
                <Download className="h-4 w-4" />
                Download QR Code
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
