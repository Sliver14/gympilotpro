'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { TrendingUp, Calendar, Loader2 } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

interface ProgressNote {
  id: string
  note: string
  weight: number | null
  createdAt: string
  trainer: {
    firstName: string
    lastName: string
  }
}

interface ProgressNotesProps {
  memberId: string
}

export default function ProgressNotes({ memberId }: ProgressNotesProps) {
  const [notes, setNotes] = useState<ProgressNote[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchProgressNotes = async () => {
      try {
        const response = await fetch(`/api/members/${memberId}/progress-notes`)
        const data = await response.json()
        setNotes(data)
      } catch (error) {
        console.error('Error fetching progress notes:', error)
        toast({
          title: 'Error',
          description: 'Failed to load progress notes',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProgressNotes()
  }, [memberId, toast])

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-[2rem] p-20 flex justify-center shadow-2xl">
        <Loader2 className="h-8 w-8 animate-spin text-[#daa857]" />
      </div>
    )
  }

  return (
    <div className="bg-card border border-border rounded-[2rem] p-8 shadow-2xl relative overflow-hidden">
      <div className="absolute -top-24 -right-24 h-48 w-48 rounded-full bg-[#daa857]/5 blur-[80px]" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
          <h3 className="text-xl font-black uppercase italic tracking-tighter text-foreground flex items-center gap-3">
            <TrendingUp className="h-5 w-5 text-[#daa857]" /> Performance <span className="text-[#daa857]">Metrics</span>
          </h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Trainer Notes</p>
        </div>

        {notes.length === 0 ? (
          <div className="text-center py-20 bg-card/50 rounded-3xl border border-dashed border-border">
            <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-sm font-bold text-muted-foreground uppercase tracking-widest italic">Progress notes pending trainer briefing.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {notes.map((note) => (
              <div key={note.id} className="rounded-2xl bg-card/50 border border-border p-6 hover:border-[#daa857]/30 transition-all group">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-black text-foreground uppercase italic tracking-tight">
                        Command: {note.trainer.firstName} {note.trainer.lastName}
                      </p>
                      <Badge className="bg-[#daa857]/10 text-[#daa857] border-[#daa857]/20 text-[8px] font-black uppercase tracking-tighter italic px-2">Elite Trainer</Badge>
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      <Calendar className="h-3 w-3" />
                      Zulu Time: {new Date(note.createdAt).toLocaleDateString('en-GB')}
                    </div>
                  </div>
                  {note.weight && (
                    <div className="bg-background border border-[#daa857]/20 rounded-xl px-4 py-2 text-center group-hover:border-[#daa857] transition-colors">
                      <p className="text-xl font-black text-[#daa857] italic leading-none">{note.weight}</p>
                      <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mt-1">BODY MASS (LBS)</p>
                    </div>
                  )}
                </div>
                <div className="mt-6 p-4 rounded-xl bg-accent border border-border group-hover:border-border transition-colors">
                  <p className="whitespace-pre-wrap text-sm font-medium text-muted-foreground leading-relaxed italic">
                    "{note.note}"
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
