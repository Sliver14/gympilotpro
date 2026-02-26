'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { TrendingUp, Calendar } from 'lucide-react'

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
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Loading progress notes...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Progress Notes
        </CardTitle>
        <CardDescription>Trainer feedback and weight tracking</CardDescription>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="mx-auto h-12 w-12 text-muted-foreground/30" />
            <p className="mt-2 text-muted-foreground">No progress notes yet. Your trainer will add notes here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div key={note.id} className="rounded-lg border border-border p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {note.trainer.firstName} {note.trainer.lastName}
                      </p>
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Trainer</span>
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {new Date(note.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  {note.weight && (
                    <div className="text-right">
                      <p className="text-sm font-semibold text-primary">{note.weight} lbs</p>
                      <p className="text-xs text-muted-foreground">Weight</p>
                    </div>
                  )}
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm text-foreground">{note.note}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
