'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle, CheckCircle, Camera, RefreshCw, Clock, Search, User, Loader2 } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

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
    <div className="flex flex-col items-center gap-10 p-4">
      {/* Result Display */}
      {result && (
        <div
          className={cn(
            "w-full max-w-lg rounded-[2.5rem] border-2 p-10 shadow-2xl relative overflow-hidden transition-all duration-500 animate-in zoom-in-95",
            result.isValid
              ? 'border-green-500/30 bg-green-500/5'
              : result.message.includes('Already checked in')
              ? 'border-[#daa857]/30 bg-[#daa857]/5'
              : 'border-red-500/30 bg-red-500/5'
          )}
        >
          <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full opacity-20 blur-[80px]" style={{ backgroundColor: result.isValid ? '#22c55e' : result.message.includes('Already checked in') ? '#daa857' : '#ef4444' }} />
          
          <div className="flex flex-col items-center text-center gap-8 relative z-10">
            {result.member && (
              <Avatar className="h-40 w-40 border-4 border-white/10 shadow-2xl group transition-transform duration-500 hover:scale-105">
                <AvatarImage src={result.member.profileImage || undefined} className="object-cover" />
                <AvatarFallback className="text-4xl bg-black font-black uppercase italic text-[#daa857]">
                  {result.member.fullName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            )}

            <div className="space-y-3">
              {result.isValid ? (
                <div className="flex items-center justify-center gap-3 text-green-500">
                  <CheckCircle className="h-8 w-8 stroke-[3px]" />
                  <span className="text-3xl font-black uppercase italic tracking-tighter">Access Granted</span>
                </div>
              ) : result.message.includes('Already checked in') ? (
                <div className="flex items-center justify-center gap-3 text-[#daa857]">
                  <Clock className="h-8 w-8 stroke-[3px]" />
                  <span className="text-3xl font-black uppercase italic tracking-tighter">Duplicate Check-in</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-3 text-red-500">
                  <AlertCircle className="h-8 w-8 stroke-[3px]" />
                  <span className="text-3xl font-black uppercase italic tracking-tighter">Access Denied</span>
                </div>
              )}
              <p className={cn(
                "text-sm font-bold uppercase tracking-widest",
                result.isValid ? 'text-green-400/70' : result.message.includes('Already checked in') ? 'text-[#daa857]/70' : 'text-red-400/70'
              )}>
                {result.message}
              </p>
            </div>

            {result.member && (
              <div className="space-y-2">
                <p className="text-3xl font-black text-white uppercase italic tracking-tighter">{result.member.fullName}</p>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Access Control System</p>
                  <p className="text-xs font-bold text-gray-400">
                    VALID UNTIL: <span className={cn("font-black italic", result.isValid ? "text-white" : "text-red-500")}>{new Date(result.member.expiryDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()}</span>
                  </p>
                </div>
              </div>
            )}

            <Button
              onClick={resetScanner}
              className={cn(
                "w-full h-16 text-black font-black uppercase tracking-widest rounded-2xl transition-all hover:scale-[1.02] shadow-xl",
                result.isValid ? "bg-green-500 hover:bg-green-600" : "bg-[#daa857] hover:bg-[#cdb48b]"
              )}
            >
              <RefreshCw className="h-5 w-5 mr-2" />
              Scan Next Member
            </Button>
          </div>
        </div>
      )}

      {/* QR Scanner Card */}
      {!result && (
        <div className="w-full max-w-lg space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="bg-[#111] border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl relative">
            <div
              id={videoContainerId}
              className={cn(
                "w-full aspect-square bg-black transition-all",
                (isScanning || isValidating) ? 'block' : 'hidden'
              )}
            />

            {!isScanning && !isValidating && (
              <div className="aspect-square flex flex-col items-center justify-center bg-black/40 relative group">
                <div className="absolute inset-0 bg-[#daa857]/5 opacity-0 group-hover:opacity-100 transition-opacity blur-[100px]" />
                {error ? (
                  <div className="text-center p-10 space-y-6 relative z-10">
                    <div className="h-20 w-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto">
                      <AlertCircle className="h-10 w-10 text-red-500" />
                    </div>
                    <p className="text-sm font-bold text-red-400 uppercase tracking-widest leading-relaxed">{error}</p>
                    <Button 
                      variant="outline" 
                      onClick={startScanner}
                      className="h-14 px-8 border-white/10 hover:bg-white/5 rounded-xl text-[10px] font-black uppercase tracking-widest"
                    >
                      Retry Neural Link
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-8 relative z-10">
                    <div className="h-24 w-24 rounded-full bg-[#daa857]/10 border border-[#daa857]/20 flex items-center justify-center mx-auto shadow-2xl shadow-[#daa857]/5">
                      <Camera className="h-10 w-10 text-[#daa857]" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Manual Check-in</h3>
                      <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em]">Scanner Ready for Uplink</p>
                    </div>
                    <Button 
                      onClick={startScanner} 
                      className="h-16 px-10 bg-[#daa857] hover:bg-[#cdb48b] text-black font-black uppercase tracking-widest rounded-2xl transition-all hover:scale-105 shadow-xl shadow-[#daa857]/10"
                    >
                      Start Neural Scan
                    </Button>
                  </div>
                )}
              </div>
            )}

            {(isScanning || isValidating) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                {isValidating ? (
                  <div className="flex flex-col items-center gap-6">
                    <Loader2 className="h-16 w-16 animate-spin text-[#daa857]" />
                    <p className="text-[10px] font-black text-[#daa857] uppercase tracking-[0.5em] animate-pulse">Decrypting Identity</p>
                  </div>
                ) : (
                  <div className="text-white text-center space-y-4">
                    <div className="relative h-64 w-64 border-2 border-[#daa857]/50 rounded-3xl animate-pulse">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#daa857]" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#daa857]" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#daa857]" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#daa857]" />
                      <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#daa857]/30 animate-scan" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#daa857]">Align Neural Code</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Manual Search & Check-in */}
          <div className="bg-[#111] border border-white/5 rounded-[2.5rem] p-8 shadow-2xl space-y-6">
            <div className="space-y-2">
              <Label htmlFor="search" className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 ml-2">Manual Override Protocol</Label>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
                  <Input
                    id="search"
                    placeholder="Search by ID, Name or Comm..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-14 pl-12 bg-black border-white/5 rounded-xl focus:border-[#daa857] font-bold"
                  />
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-14 w-14 border-white/5 bg-black hover:bg-white/5 rounded-xl text-gray-500"
                  onClick={() => setSearchQuery('')}
                  disabled={!searchQuery}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {searchQuery && (
              <div className="max-h-80 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {searchLoading ? (
                  <div className="p-10 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-[#daa857] mx-auto" />
                  </div>
                ) : filteredMembers.length > 0 ? (
                  filteredMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-[#daa857]/30 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12 border border-white/10">
                          <AvatarImage src={member.profileImage || undefined} className="object-cover" />
                          <AvatarFallback className="bg-black text-[#daa857] font-black italic text-xs">
                            {member.fullName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-black text-white uppercase italic tracking-tight">{member.fullName}</p>
                          <p className="text-[8px] font-bold text-gray-600 uppercase tracking-widest">
                            EXP: {new Date(member.expiryDate).toLocaleDateString().toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => manualCheckIn(member)}
                        disabled={isValidating}
                        className="h-10 px-6 bg-white/5 hover:bg-[#daa857] hover:text-black text-gray-400 font-black uppercase text-[10px] tracking-widest rounded-xl transition-all"
                      >
                        Override
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="p-10 text-center rounded-2xl bg-black/20 border border-dashed border-white/5">
                    <p className="text-xs font-black text-gray-700 uppercase tracking-widest italic italic">No active members match "{searchQuery}"</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}