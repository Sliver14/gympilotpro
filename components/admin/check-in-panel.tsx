'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle, Camera, RefreshCw, Clock, Search, User } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

interface MemberInfo {
  id: string
  fullName: string
  profileImage: string | null
  expiryDate: string
}

interface ValidationResult {
  isValid: boolean
  message: string
  member?: MemberInfo
}

export default function CheckInPanel() {
  const { toast } = useToast()
  const [isScanning, setIsScanning] = useState(false)
  const [isValidating, setIsValidating] = useState(false)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<MemberInfo[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const videoContainerId = 'qr-reader'

  // All members (fetched once on mount)
  const [allMembers, setAllMembers] = useState<MemberInfo[]>([])

  const initializeScanner = useCallback(() => {
    if (scannerRef.current) return
    scannerRef.current = new Html5Qrcode(videoContainerId)
  }, [])

  // Fetch all members once when component mounts
  useEffect(() => {
    const fetchAllMembers = async () => {
      try {
        const res = await fetch('/api/admin/members')
        if (!res.ok) throw new Error('Failed to fetch members')
        const members = await res.json()

        const formatted = members.map((m: any) => ({
          id: m.id,
          fullName: `${m.firstName} ${m.lastName}`,
          profileImage: m.profileImage || null,
          expiryDate: m.memberProfile?.expiryDate || '',
        }))

        setAllMembers(formatted)
      } catch (err) {
        console.error('Failed to load members:', err)
      }
    }

    fetchAllMembers()
  }, [])

  // Filter members client-side based on search query
  const filteredMembers = searchQuery.trim()
    ? allMembers.filter(m =>
        m.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.id.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : []

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

      if (!scannerRef.current) {
        throw new Error('Scanner not initialized')
      }

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
              // Removed auto-reset: setTimeout(() => resetScanner(), 5000)
            } else {
              const isDuplicate = data.message.includes('Already checked in')
              toast({
                title: isDuplicate ? 'Duplicate Scan' : 'Check-in Failed',
                description: data.message,
                variant: isDuplicate ? 'default' : 'destructive',
                duration: isDuplicate ? 6000 : 4000,
              })
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
          const errMsg = typeof err === 'string' ? err : (err as any)?.errorMessage || ''
          if (errMsg.includes('No MultiFormat Readers')) return
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

  // Manual check-in from search results
  const manualCheckIn = async (member: MemberInfo) => {
    setIsValidating(true)

    try {
      const res = await fetch('/api/checkin/validate-qr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: member.id }), // backend accepts memberId
      })

      const data: ValidationResult = await res.json()
      setResult(data)

      if (data.isValid) {
        toast({
          title: 'Manual Check-in Success',
          description: data.message,
          variant: 'default',
        })
        // Removed auto-reset: setTimeout(resetScanner, 5000)
      } else {
        const isDuplicate = data.message.includes('Already checked in')
        toast({
          title: isDuplicate ? 'Duplicate Check-in' : 'Check-in Failed',
          description: data.message,
          variant: isDuplicate ? 'default' : 'destructive',
          duration: isDuplicate ? 6000 : 4000,
        })
      }
    } catch (err: any) {
      toast({
        title: 'Check-in Error',
        description: err.message || 'Failed to check in member.',
        variant: 'destructive',
      })
    } finally {
      setIsValidating(false)
    }
  }

  useEffect(() => {
    initializeScanner()
    return () => {
      stopScanner()
      scannerRef.current = null
    }
  }, [initializeScanner, stopScanner, startScanner])

  return (
    <div className="flex flex-col gap-6 p-4">
      {/* Result Display (Show at top if exists) */}
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
              {result.member && (
                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                  <AvatarImage src={result.member.profileImage || undefined} className="object-cover" />
                  <AvatarFallback className="text-2xl">
                    <User className="h-16 w-16" />
                  </AvatarFallback>
                </Avatar>
              )}

              <div className="space-y-1">
                {result.isValid ? (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle className="h-6 w-6" />
                    <span className="text-xl font-bold uppercase tracking-wider">Access Granted</span>
                  </div>
                ) : result.message.includes('Already checked in') ? (
                  <div className="flex items-center justify-center gap-2 text-orange-600">
                    <Clock className="h-6 w-6" />
                    <span className="text-xl font-bold uppercase tracking-wider">Duplicate Scan</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-destructive">
                    <AlertCircle className="h-6 w-6" />
                    <span className="text-xl font-bold uppercase tracking-wider">Access Denied</span>
                  </div>
                )}
                <h2
                  className={`text-lg font-medium ${
                    result.isValid
                      ? 'text-green-700'
                      : result.message.includes('Already checked in')
                      ? 'text-orange-700'
                      : 'text-destructive'
                  }`}
                >
                  {result.message}
                </h2>
              </div>

              {result.member && (
                <div className="space-y-1">
                  <p className="text-2xl font-bold">{result.member.fullName}</p>
                  <p className="text-sm text-muted-foreground">
                    Membership Expires: <span className="font-semibold text-foreground">{new Date(result.member.expiryDate).toLocaleDateString('en-GB')}</span>
                  </p>
                </div>
              )}
            </div>

            <Button
              onClick={resetScanner}
              className="w-full gap-2 h-12 text-lg font-semibold"
              variant={result.isValid ? 'default' : result.message.includes('Already checked in') ? 'secondary' : 'outline'}
            >
              <RefreshCw className="h-5 w-5" />
              Scan Next Member
            </Button>
          </CardContent>
        </Card>
      )}

      {/* QR Scanner Card */}
      {!result && (
        <Card className="w-full max-w-md overflow-hidden border-2 relative">
          <div
            id={videoContainerId}
            className={`w-full aspect-square bg-black transition-all ${
              isScanning || isValidating ? 'block' : 'hidden'
            }`}
          />

          {!isScanning && !isValidating && (
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
                <Spinner className="h-12 w-12 text-white" />
              ) : (
                <div className="text-white text-center">
                  <p className="text-lg font-medium">Scanning...</p>
                  <p className="text-sm opacity-80">Align QR code in the box</p>
                </div>
              )}
            </div>
          )}
        </Card>
      )}

      {/* Manual Search & Check-in */}
      {!result && (
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="search">Manual Check-in (search by name/email/phone)</Label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  placeholder="Type name, email or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && e.preventDefault()}
                />
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={() => setSearchQuery('')}
                  disabled={!searchQuery}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {searchQuery && (
              <div className="max-h-64 overflow-y-auto border rounded-md">
                {searchLoading ? (
                  <div className="p-4 text-center text-muted-foreground">
                    <Spinner className="h-5 w-5 mx-auto" />
                  </div>
                ) : filteredMembers.length > 0 ? (
                  <div className="divide-y">
                    {filteredMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={member.profileImage || undefined} className="object-cover" />
                            <AvatarFallback>
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{member.fullName}</p>
                            <p className="text-xs text-muted-foreground">
                              Expires: {new Date(member.expiryDate).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => manualCheckIn(member)}
                          disabled={isValidating}
                        >
                          Check-in
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No members found matching "{searchQuery}"
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}