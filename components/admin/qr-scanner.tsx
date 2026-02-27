'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { AlertCircle, CheckCircle, Camera, Loader2, RefreshCw, Clock } from 'lucide-react'

interface MemberInfo {
  fullName: string
  profileImage: string | null
  expiryDate: string
}

interface ValidationResult {
  isValid: boolean
  message: string
  member?: MemberInfo
}

export default function QRScanner() {
  const { toast } = useToast()
  const [isScanning, setIsScanning] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const videoContainerId = 'qr-reader'

  const initializeScanner = useCallback(() => {
    if (scannerRef.current) return
    scannerRef.current = new Html5Qrcode(videoContainerId)
  }, [])

  const startScanner = useCallback(async () => {
    if (!scannerRef.current) initializeScanner()

    setError(null)
    setResult(null)
    setIsValidating(false)

    try {
      const cameras = await Html5Qrcode.getCameras()
      if (cameras.length === 0) {
        setError('No cameras found on this device.')
        return
      }

      setIsScanning(true)

      await scannerRef.current.start(
        { facingMode: 'environment' },
        {
          fps: 12,
          qrbox: { width: 280, height: 280 },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        async (decodedText) => {
          setIsScanning(false)
          setIsValidating(true)
          scannerRef.current?.pause()

          try {
            const res = await fetch('/api/checkin/validate-qr', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ qrCodeData: decodedText.trim() }),
            })

            const data: ValidationResult = await res.json()

            setResult(data)

            if (data.isValid) {
              toast({
                title: 'Valid Entry',
                description: data.message,
                variant: 'default',
              })
              // Auto-restart after success (5 seconds)
              setTimeout(() => resetScanner(), 5000)
            } else {
              // Differentiate duplicate vs other errors
              if (data.message.includes('Already checked in')) {
                toast({
                  title: 'Duplicate Scan',
                  description: data.message,
                  variant: 'default', // neutral/yellow warning
                  duration: 6000,
                })
              } else {
                toast({
                  title: data.message.includes('expired') ? 'Membership Expired' : 'Invalid Scan',
                  description: data.message,
                  variant: data.message.includes('expired') ? 'destructive' : 'default',
                })
              }
            }
          } catch (err: any) {
            toast({
              title: 'Validation Error',
              description: err.message || 'Could not verify membership.',
              variant: 'destructive',
            })
            setError(err.message)
          } finally {
            setIsValidating(false)
          }
        },
        (err) => {
          // Suppress common "no code found" noise
          if (err?.errorMessage?.includes('No MultiFormat Readers')) return
          console.debug('Scan error:', err)
        }
      )
    } catch (err: any) {
      setError(
        err.name === 'NotAllowedError'
          ? 'Camera access denied. Please allow camera permission.'
          : 'Failed to start scanner. Try again.'
      )
      setIsScanning(false)
    }
  }, [initializeScanner, toast])

  const stopScanner = useCallback(async () => {
    if (scannerRef.current?.isScanning) {
      try {
        await scannerRef.current.stop()
      } catch (err) {
        console.warn('Stop scanner failed:', err)
      }
    }
    setIsScanning(false)
  }, [])

  const resetScanner = useCallback(() => {
    stopScanner().then(() => {
      setResult(null)
      setError(null)
      startScanner()
    })
  }, [stopScanner, startScanner])

  useEffect(() => {
    initializeScanner()
    // Auto-start disabled — use manual button
    return () => {
      stopScanner()
      scannerRef.current = null
    }
  }, [initializeScanner, stopScanner, startScanner])

  return (
    <div className="flex flex-col items-center gap-6 p-4">
      <Card className="w-full max-w-md overflow-hidden border-2">
        <div
          id={videoContainerId}
          className={`w-full aspect-square bg-black transition-all ${
            isScanning || isValidating ? 'block' : 'hidden'
          }`}
        />

        {!isScanning && !isValidating && !result && (
          <div className="aspect-square flex flex-col items-center justify-center bg-muted/50">
            {error ? (
              <div className="text-center p-6 space-y-3">
                <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
                <p className="font-medium text-destructive">{error}</p>
                <Button variant="outline" onClick={startScanner}>
                  Retry Camera
                </Button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <Camera className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Ready to scan member QR code</p>
                <Button onClick={startScanner} size="lg" className="gap-2">
                  <Camera className="h-5 w-5" />
                  Start Scanning
                </Button>
              </div>
            )}
          </div>
        )}

        {(isScanning || isValidating) && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            {isValidating ? (
              <Loader2 className="h-12 w-12 animate-spin text-white" />
            ) : (
              <div className="text-white text-center">
                <p className="text-lg font-medium">Scanning...</p>
                <p className="text-sm opacity-80">Align QR code in the box</p>
              </div>
            )}
          </div>
        )}
      </Card>

      {result && (
        <Card
          className={`w-full max-w-md border-2 transition-colors ${
            result.isValid
              ? 'border-green-500/50 bg-green-50/30'
              : result.message.includes('Already checked in')
              ? 'border-orange-500/50 bg-orange-50/30'
              : 'border-destructive/50 bg-destructive/10'
          }`}
        >
          <CardContent className="pt-6 space-y-6">
            <div className="flex flex-col items-center text-center gap-4">
              {result.isValid ? (
                <CheckCircle className="h-14 w-14 text-green-600" />
              ) : result.message.includes('Already checked in') ? (
                <Clock className="h-14 w-14 text-orange-600" />
              ) : (
                <AlertCircle className="h-14 w-14 text-destructive" />
              )}

              <h2
                className={`text-2xl font-bold ${
                  result.isValid
                    ? 'text-green-700'
                    : result.message.includes('Already checked in')
                    ? 'text-orange-700'
                    : 'text-destructive'
                }`}
              >
                {result.message}
              </h2>

              {result.member && (
                <>
                  <Avatar className="h-28 w-28 border-4 border-background shadow-xl">
                    <AvatarImage src={result.member.profileImage || '/default-avatar.png'} />
                    <AvatarFallback className="text-2xl">
                      {result.member.fullName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="text-xl font-semibold">{result.member.fullName}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Expires: {new Date(result.member.expiryDate).toLocaleDateString('en-GB')}
                    </p>
                  </div>
                </>
              )}
            </div>

            <Button
              onClick={resetScanner}
              className="w-full gap-2"
              variant={result.isValid ? 'default' : result.message.includes('Already checked in') ? 'secondary' : 'outline'}
            >
              <RefreshCw className="h-4 w-4" />
              Scan Next Member
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}