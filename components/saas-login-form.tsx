'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, ShieldCheck, Activity, Users, Building2 } from 'lucide-react'

export default function SaaSLoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/saas-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Login failed')
      }

      toast({
        title: 'Login successful',
        description: 'Welcome back, Super Admin!',
      })

      router.push('/saas-admin/dashboard')
    } catch (error: any) {
      toast({
        title: 'Authentication Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-zinc-950">
      {/* Left side - Branding */}
      <div className="w-full md:w-1/2 lg:w-3/5 bg-gradient-to-br from-orange-800 to-zinc-950 p-8 md:p-12 flex flex-col justify-between text-white relative overflow-hidden border-r border-zinc-800/50">
        {/* Abstract background pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <div className="relative z-10 flex items-center gap-2 mb-8 md:mb-0">
          <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-orange-400" />
          <span className="text-2xl md:text-3xl font-bold tracking-tight text-zinc-100">GymPilotPro</span>
        </div>

        <div className="relative z-10 hidden md:flex flex-col gap-6 max-w-lg">
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight text-zinc-50">
            Platform Management Console
          </h1>
          <p className="text-zinc-300 text-lg">
            Monitor gym performance, manage SaaS subscriptions, and oversee platform revenue from a centralized, high-level dashboard.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="flex items-center gap-3 p-4 bg-zinc-900/60 rounded-xl backdrop-blur-md border border-zinc-700/50">
              <Building2 className="w-6 h-6 text-orange-400" />
              <span className="font-medium text-zinc-200">Tenant Management</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-zinc-900/60 rounded-xl backdrop-blur-md border border-zinc-700/50">
              <Users className="w-6 h-6 text-orange-400" />
              <span className="font-medium text-zinc-200">User Analytics</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-zinc-900/60 rounded-xl backdrop-blur-md border border-zinc-700/50 col-span-2">
              <Activity className="w-6 h-6 text-orange-400" />
              <span className="font-medium text-zinc-200">Real-time Performance Metrics</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 hidden md:block text-zinc-500 text-sm mt-8">
          &copy; {new Date().getFullYear()} GymPilotPro. All rights reserved.
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-6 md:p-12 bg-zinc-950 flex-1 z-20 rounded-t-3xl md:rounded-none -mt-6 md:mt-0 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-zinc-100 tracking-tight">Administrator Login</h2>
            <p className="text-zinc-400 mt-2">Enter your superadmin credentials to access the console.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 mt-8">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300 font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@gympilotpro.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 px-4 bg-zinc-900/80 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:bg-zinc-900 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-300 font-medium">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 px-4 bg-zinc-900/80 border-zinc-800 text-zinc-100 placeholder:text-zinc-600 focus:bg-zinc-900 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-900/20 transition-all active:scale-[0.98]" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Access Dashboard'
              )}
            </Button>
          </form>
          
          <div className="text-center md:hidden pt-8 pb-4 text-zinc-600 text-xs">
            &copy; {new Date().getFullYear()} GymPilotPro.
          </div>
        </div>
      </div>
    </div>
  )
}
