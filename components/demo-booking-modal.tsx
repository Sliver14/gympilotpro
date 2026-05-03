'use client'

import React, { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Check, Loader2 } from 'lucide-react'
import { InlineWidget } from 'react-calendly'

interface DemoBookingModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function DemoBookingModal({ isOpen, onClose }: DemoBookingModalProps) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    gymName: '',
    phoneNumber: '',
    memberCount: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, memberCount: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const response = await fetch('/api/demo-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error('Failed to save lead')
      }
      
      setStep(2)
    } catch (error) {
      console.error('Error saving lead:', error)
      // You could add a toast here if you have a useToast hook
    } finally {
      setLoading(false)
    }
  }

  const resetModal = () => {
    setStep(1)
    setFormData({
      gymName: '',
      phoneNumber: '',
      memberCount: '',
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        onClose()
        setTimeout(resetModal, 300)
      }
    }}>
      <DialogContent className="sm:max-w-[600px] bg-[#0d0d0d] border-border text-foreground p-0 overflow-hidden rounded-none border-2">
        <div className="p-6 sm:p-8">
          <DialogHeader className="sr-only">
            <DialogTitle>Demo Booking</DialogTitle>
            <DialogDescription>Set up your 5-minute demo with GymPilot Pro.</DialogDescription>
          </DialogHeader>

          {step === 1 ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl sm:text-3xl font-black uppercase italic tracking-tighter">
                  Let's Set Up Your <span className="text-orange-500">Demo</span>
                </h2>
                <p className="text-muted-foreground font-medium">
                  Tell us a bit about your gym so we can tailor the demo for you.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="gymName" className="text-xs font-black uppercase tracking-widest text-orange-500">Gym Name</Label>
                  <Input
                    id="gymName"
                    name="gymName"
                    required
                    placeholder="Enter your gym name"
                    value={formData.gymName}
                    onChange={handleInputChange}
                    className="bg-white/5 border-border rounded-none h-12 focus-visible:ring-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phoneNumber" className="text-xs font-black uppercase tracking-widest text-orange-500">Phone Number (WhatsApp preferred)</Label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    required
                    type="tel"
                    placeholder="e.g., +234 806 1731 600"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="bg-white/5 border-border rounded-none h-12 focus-visible:ring-orange-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="memberCount" className="text-xs font-black uppercase tracking-widest text-orange-500">Number of Members</Label>
                  <Select
                    onValueChange={handleSelectChange}
                    required
                    value={formData.memberCount}
                  >
                    <SelectTrigger className="bg-white/5 border-border rounded-none h-12 focus:ring-orange-500">
                      <SelectValue placeholder="Select member range" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d0d0d] border-border text-foreground rounded-none">
                      <SelectItem value="0-50">0–50 members</SelectItem>
                      <SelectItem value="50-150">50–150 members</SelectItem>
                      <SelectItem value="150+">150+ members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-14 bg-orange-500 hover:bg-orange-600 text-white font-black uppercase rounded-none mt-4"
                >
                  {loading ? (
                    <Loader2 className="animate-spin mr-2" />
                  ) : (
                    'Continue'
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center gap-4 mb-6 p-4 bg-orange-500/10 border border-orange-500/20">
                <div className="w-12 h-12 bg-orange-500 flex items-center justify-center shrink-0">
                  <Check className="text-white" size={24} strokeWidth={3} />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">Nice — this looks like a good fit.</h3>
                  <p className="text-sm text-muted-foreground font-medium">We're ready to show you how to protect your revenue.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h4 className="text-lg font-black uppercase italic">Pick a time for your demo</h4>
                  <p className="text-sm text-muted-foreground">We'll show you exactly how GymPilot Pro works.</p>
                </div>

                {/* Live Calendly Widget */}
                <div className="w-full h-[450px] bg-white/5 border border-border overflow-hidden">
                  <InlineWidget
                    url="https://calendly.com/silverchristopher12/30min"
                    prefill={{
                      name: formData.gymName,
                      customAnswers: {
                        a1: formData.phoneNumber
                      }
                    }}
                    styles={{
                      height: '450px'
                    }}
                  />
                </div>

                <Button
                  onClick={onClose}
                  variant="outline"
                  className="w-full h-12 border-border hover:bg-white/5 font-black uppercase rounded-none mt-4"
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
