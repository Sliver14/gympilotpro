'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { MessageSquare, Mail, AlertTriangle, Send } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

export default function SupportClient() {
  const { toast } = useToast()
  
  // Contact Us Form State
  const [contactName, setContactName] = useState('')
  const [contactSubject, setContactSubject] = useState('')
  const [contactMessage, setContactMessage] = useState('')

  // Suggest an Improvement State
  const [suggestTitle, setSuggestTitle] = useState('')
  const [suggestUrgency, setSuggestUrgency] = useState('medium')
  const [suggestDesc, setSuggestDesc] = useState('')

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
  }

  const handleWhatsAppRedirect = () => {
    const phone = '2348061731600'
    const message = encodeURIComponent('Hello GymPilot Pro Support, I need help with...')
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
    toast({ title: 'Opening WhatsApp', description: 'Redirecting to Live Chat on WhatsApp.' })
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto px-4 py-8">
      
      {/* Page Title */}
      <div className="text-center space-y-3">
        <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">
          Customer <span className="text-primary">Support</span>
        </h1>
        <p className="text-sm text-muted-foreground max-w-xl mx-auto font-medium">
          Need help? Connect with our team via live chat, send us a direct email, or suggest improvements to help us serve you better.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Live Chat Card */}
        <Card className="rounded-[2rem] border border-border shadow-xl bg-card/50 backdrop-blur-md flex flex-col justify-between overflow-hidden relative group">
          <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />
          <CardHeader className="pb-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <MessageSquare className="h-6 w-6" />
            </div>
            <CardTitle className="font-black text-2xl uppercase tracking-tighter">Live Chat</CardTitle>
            <CardDescription className="text-xs font-semibold">
              Instant support via WhatsApp for quick resolutions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-0">
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Connect with our live support agents directly on WhatsApp. Perfect for setup assistance, check-in questions, or billing queries.
            </p>
            <Button 
              onClick={handleWhatsAppRedirect}
              className="w-full h-14 bg-green-500 hover:bg-green-600 text-white font-black rounded-xl transition-all uppercase tracking-wider text-xs shadow-lg shadow-green-500/10"
            >
              Start WhatsApp Chat
            </Button>
          </CardContent>
        </Card>

        {/* Contact Us Card */}
        <Card className="rounded-[2rem] border border-border shadow-xl bg-card/50 backdrop-blur-md overflow-hidden relative group">
          <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />
          <CardHeader className="pb-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <Mail className="h-6 w-6" />
            </div>
            <CardTitle className="font-black text-2xl uppercase tracking-tighter">Contact Us</CardTitle>
            <CardDescription className="text-xs font-semibold">
              Send an email to admin@insightnovatech.com.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="contactName" className="text-[10px] font-black uppercase tracking-wider">Your Name</Label>
                <Input 
                  id="contactName"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="h-12 rounded-xl bg-background border-border font-bold text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contactSubject" className="text-[10px] font-black uppercase tracking-wider">Subject</Label>
                <Input 
                  id="contactSubject"
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  placeholder="e.g. Subscription issue"
                  className="h-12 rounded-xl bg-background border-border font-bold text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="contactMessage" className="text-[10px] font-black uppercase tracking-wider">Message</Label>
                <Textarea 
                  id="contactMessage"
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Type your message details..."
                  className="rounded-xl bg-background border-border font-bold text-xs"
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/95 text-primary-foreground font-black rounded-xl uppercase tracking-wider text-xs">
                <Send className="h-4 w-4 mr-2" /> Send Email
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Suggest Improvement Card */}
        <Card className="rounded-[2rem] border border-border shadow-xl bg-card/50 backdrop-blur-md overflow-hidden relative group">
          <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-primary/5 blur-2xl group-hover:bg-primary/10 transition-colors" />
          <CardHeader className="pb-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <CardTitle className="font-black text-2xl uppercase tracking-tighter">Suggest Improvement</CardTitle>
            <CardDescription className="text-xs font-semibold">
              Share feature ideas or feedback with our product team.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleSuggestionSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="suggestTitle" className="text-[10px] font-black uppercase tracking-wider">Suggestion Title</Label>
                <Input 
                  id="suggestTitle"
                  value={suggestTitle}
                  onChange={(e) => setSuggestTitle(e.target.value)}
                  placeholder="e.g. Add dark mode to member dashboard"
                  className="h-12 rounded-xl bg-background border-border font-bold text-xs"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="suggestUrgency" className="text-[10px] font-black uppercase tracking-wider">Urgency Level</Label>
                <Select value={suggestUrgency} onValueChange={setSuggestUrgency}>
                  <SelectTrigger id="suggestUrgency" className="h-12 rounded-xl bg-background border-border font-bold text-xs">
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
                <Label htmlFor="suggestDesc" className="text-[10px] font-black uppercase tracking-wider">Description</Label>
                <Textarea 
                  id="suggestDesc"
                  value={suggestDesc}
                  onChange={(e) => setSuggestDesc(e.target.value)}
                  placeholder="Explain your suggestion and how it would improve the system..."
                  className="rounded-xl bg-background border-border font-bold text-xs"
                  rows={3}
                />
              </div>
              <Button type="submit" className="w-full h-12 bg-primary hover:bg-primary/95 text-primary-foreground font-black rounded-xl uppercase tracking-wider text-xs">
                Submit Feedback
              </Button>
            </form>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
