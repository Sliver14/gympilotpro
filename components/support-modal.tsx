'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MessageSquare, Mail, AlertTriangle, Send, ChevronRight, ArrowLeft, LifeBuoy } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { usePathname } from 'next/navigation'

export function SupportModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [view, setView] = useState<'menu' | 'contact' | 'improvement'>('menu')
  const { toast } = useToast()
  const pathname = usePathname()

  // Form States
  const [contactName, setContactName] = useState('')
  const [contactSubject, setContactSubject] = useState('')
  const [contactMessage, setContactMessage] = useState('')
  const [suggestTitle, setSuggestTitle] = useState('')
  const [suggestUrgency, setSuggestUrgency] = useState('medium')
  const [suggestDesc, setSuggestDesc] = useState('')

  // Listen for global trigger events (e.g. from sidebar clicks)
  useEffect(() => {
    const handleOpen = () => {
      setView('menu')
      setIsOpen(true)
    }
    window.addEventListener('open-support-modal', handleOpen)
    return () => window.removeEventListener('open-support-modal', handleOpen)
  }, [])

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactName || !contactSubject || !contactMessage) {
      toast({ title: 'Validation Error', description: 'Please fill in all fields', variant: 'destructive' })
      return
    }

    const email = 'admin@insightnovatech.com'
    const subject = encodeURIComponent(`[Support Inquiry] ${contactSubject}`)
    const body = encodeURIComponent(
      `Name: ${contactName}\n\nMessage:\n${contactMessage}\n\n---\nSent via GymPilot Pro Customer Support.`
    )
    
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
    toast({ title: 'Opening Email Client', description: 'Your default mail app is opening to send this message.' })
    setIsOpen(false)
  }

  const handleSuggestionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!suggestTitle || !suggestDesc) {
      toast({ title: 'Validation Error', description: 'Please fill in all fields', variant: 'destructive' })
      return
    }

    const email = 'admin@insightnovatech.com'
    const subject = encodeURIComponent(`[Improvement Suggestion] [Urgency: ${suggestUrgency.toUpperCase()}] ${suggestTitle}`)
    const body = encodeURIComponent(
      `Suggestion Title: ${suggestTitle}\nUrgency: ${suggestUrgency.toUpperCase()}\n\nDescription:\n${suggestDesc}\n\n---\nSent via GymPilot Pro Feedback Portal.`
    )
    
    window.location.href = `mailto:${email}?subject=${subject}&body=${body}`
    toast({ title: 'Opening Email Client', description: 'Your default mail app is opening to send this suggestion.' })
    setIsOpen(false)
  }

  const handleWhatsAppRedirect = () => {
    const phone = '2348061731600'
    const message = encodeURIComponent('Hello GymPilot Pro Support, I need help with...')
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
    toast({ title: 'Opening WhatsApp', description: 'Redirecting to Live Chat on WhatsApp.' })
    setIsOpen(false)
  }

  // Determine if the floating support button should show
  // We hide it on full payment pages or setup states, but show generally
  const showFloatingButton = !pathname.includes('/setup') && !pathname.includes('/payment/success')

  return (
    <>
      {/* Floating Support Trigger Button */}
      {showFloatingButton && (
        <button
          onClick={() => { setView('menu'); setIsOpen(true) }}
          className="fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-orange-500 hover:bg-orange-600 text-white flex items-center justify-center shadow-[0_4px_20px_rgba(249,115,22,0.4)] hover:scale-110 active:scale-95 transition-all duration-300"
          aria-label="Open support options"
        >
          <LifeBuoy className="h-6 w-6 animate-[spin_8s_linear_infinite]" />
        </button>
      )}

      {/* Reusable Support Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="w-[92vw] sm:w-full sm:max-w-md rounded-2xl md:rounded-[2.5rem] bg-card border-border text-foreground p-6 overflow-hidden">
          
          {/* MENU VIEW */}
          {view === 'menu' && (
            <div className="space-y-6">
              <DialogHeader className="text-left">
                <DialogTitle className="text-2xl font-black uppercase tracking-tighter italic">
                  Support <span className="text-primary">Center</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground font-semibold">
                  How can we help you run your gym like a pro today?
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-3">
                {/* Live Chat / WhatsApp */}
                <button
                  onClick={handleWhatsAppRedirect}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-border bg-background hover:bg-green-500/10 hover:border-green-500/30 transition-all duration-300 text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-tight">Live Chat</h4>
                      <p className="text-[10px] text-muted-foreground font-semibold">Connect instantly on WhatsApp</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-green-500 transition-colors" />
                </button>

                {/* Email Support */}
                <button
                  onClick={() => setView('contact')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-border bg-background hover:bg-primary/10 hover:border-primary/30 transition-all duration-300 text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                      <Mail className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-tight">Contact Us</h4>
                      <p className="text-[10px] text-muted-foreground font-semibold">Send a direct support inquiry</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>

                {/* Suggest Improvement */}
                <button
                  onClick={() => setView('improvement')}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-border bg-background hover:bg-orange-500/10 hover:border-orange-500/30 transition-all duration-300 text-left group"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                      <AlertTriangle className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm uppercase tracking-tight">Suggest Improvement</h4>
                      <p className="text-[10px] text-muted-foreground font-semibold">Submit ideas and feedback</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-orange-500 transition-colors" />
                </button>
              </div>
            </div>
          )}

          {/* CONTACT FORM VIEW */}
          {view === 'contact' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setView('menu')} 
                  className="h-8 w-8 rounded-full border"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <DialogTitle className="text-xl font-black uppercase tracking-tighter">Contact Us</DialogTitle>
                  <DialogDescription className="text-[10px] font-semibold text-muted-foreground">
                    Inquiry will go to admin@insightnovatech.com
                  </DialogDescription>
                </div>
              </div>

              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="modalName" className="text-[9px] font-black uppercase tracking-wider">Your Name</Label>
                  <Input 
                    id="modalName"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="h-11 rounded-xl bg-background border-border font-bold text-xs"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="modalSubject" className="text-[9px] font-black uppercase tracking-wider">Subject</Label>
                  <Input 
                    id="modalSubject"
                    value={contactSubject}
                    onChange={(e) => setContactSubject(e.target.value)}
                    placeholder="e.g. Access control question"
                    className="h-11 rounded-xl bg-background border-border font-bold text-xs"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="modalMessage" className="text-[9px] font-black uppercase tracking-wider">Message Details</Label>
                  <Textarea 
                    id="modalMessage"
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Describe your issue or inquiry..."
                    className="rounded-xl bg-background border-border font-bold text-xs min-h-[90px]"
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/95 text-primary-foreground font-black rounded-xl uppercase tracking-wider text-xs">
                  <Send className="h-3.5 w-3.5 mr-2" /> Send Email
                </Button>
              </form>
            </div>
          )}

          {/* IMPROVEMENT SUGGESTION VIEW */}
          {view === 'improvement' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setView('menu')} 
                  className="h-8 w-8 rounded-full border"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <DialogTitle className="text-xl font-black uppercase tracking-tighter">Suggest Improvement</DialogTitle>
                  <DialogDescription className="text-[10px] font-semibold text-muted-foreground">
                    Provide feedback to our engineering team
                  </DialogDescription>
                </div>
              </div>

              <form onSubmit={handleSuggestionSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="modalSuggestTitle" className="text-[9px] font-black uppercase tracking-wider">Suggestion Title</Label>
                  <Input 
                    id="modalSuggestTitle"
                    value={suggestTitle}
                    onChange={(e) => setSuggestTitle(e.target.value)}
                    placeholder="e.g. Add dark mode switch to admin view"
                    className="h-11 rounded-xl bg-background border-border font-bold text-xs"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="modalSuggestUrgency" className="text-[9px] font-black uppercase tracking-wider">Urgency Level</Label>
                  <Select value={suggestUrgency} onValueChange={setSuggestUrgency}>
                    <SelectTrigger id="modalSuggestUrgency" className="h-11 rounded-xl bg-background border-border font-bold text-xs">
                      <SelectValue placeholder="Select urgency" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover border-border rounded-xl">
                      <SelectItem value="low" className="font-bold text-xs">Low (Nice to Have)</SelectItem>
                      <SelectItem value="medium" className="font-bold text-xs">Medium (Standard Improvement)</SelectItem>
                      <SelectItem value="high" className="font-bold text-xs">High (Important Polish)</SelectItem>
                      <SelectItem value="critical" className="font-bold text-xs text-red-500">Critical (Feature Blocker)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="modalSuggestDesc" className="text-[9px] font-black uppercase tracking-wider">Description</Label>
                  <Textarea 
                    id="modalSuggestDesc"
                    value={suggestDesc}
                    onChange={(e) => setSuggestDesc(e.target.value)}
                    placeholder="Detail your request and how it adds value to the system..."
                    className="rounded-xl bg-background border-border font-bold text-xs min-h-[90px]"
                    required
                  />
                </div>
                <Button type="submit" className="w-full h-11 bg-primary hover:bg-primary/95 text-primary-foreground font-black rounded-xl uppercase tracking-wider text-xs">
                  Submit Feedback
                </Button>
              </form>
            </div>
          )}

        </DialogContent>
      </Dialog>
    </>
  )
}
