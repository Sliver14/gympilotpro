'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, ShieldCheck, Activity, Users, Building2 } from 'lucide-react'

export default function SaaSLoginPage() {
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
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      {/* Left side - Branding (Hidden on very small screens, shown as header on small, full height on md+) */}
      <div className="w-full md:w-1/2 lg:w-3/5 bg-gradient-to-br from-orange-600 to-orange-800 p-8 md:p-12 flex flex-col justify-between text-white relative overflow-hidden">
        {/* Abstract background pattern */}
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px' }}></div>
        
        <div className="relative z-10 flex items-center gap-2 mb-8 md:mb-0">
          <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-orange-200" />
          <span className="text-2xl md:text-3xl font-bold tracking-tight">GymPilotPro</span>
        </div>

        <div className="relative z-10 hidden md:flex flex-col gap-6 max-w-lg">
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight">
            Platform Management Console
          </h1>
          <p className="text-orange-100 text-lg">
            Monitor gym performance, manage SaaS subscriptions, and oversee platform revenue from a centralized, high-level dashboard.
          </p>
          
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="flex items-center gap-3 p-4 bg-orange-900/30 rounded-xl backdrop-blur-sm border border-orange-500/30">
              <Building2 className="w-6 h-6 text-orange-300" />
              <span className="font-medium text-orange-50">Tenant Management</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-orange-900/30 rounded-xl backdrop-blur-sm border border-orange-500/30">
              <Users className="w-6 h-6 text-orange-300" />
              <span className="font-medium text-orange-50">User Analytics</span>
            </div>
            <div className="flex items-center gap-3 p-4 bg-orange-900/30 rounded-xl backdrop-blur-sm border border-orange-500/30 col-span-2">
              <Activity className="w-6 h-6 text-orange-300" />
              <span className="font-medium text-orange-50">Real-time Performance Metrics</span>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 hidden md:block text-orange-200/60 text-sm mt-8">
          &copy; {new Date().getFullYear()} GymPilotPro. All rights reserved.
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex items-center justify-center p-6 md:p-12 bg-white flex-1 shadow-2xl md:shadow-none z-20 rounded-t-3xl md:rounded-none -mt-6 md:mt-0 relative">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Administrator Login</h2>
            <p className="text-gray-500 mt-2">Enter your superadmin credentials to access the console.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6 mt-8">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@gympilotpro.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 px-4 bg-gray-50 border-gray-200 focus:bg-white focus:ring-orange-500"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 px-4 bg-gray-50 border-gray-200 focus:bg-white focus:ring-orange-500"
              />
            </div>

            <Button 
              type="submit" 
              className="w-full h-12 text-base font-semibold bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/20 transition-all active:scale-[0.98]" 
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
          
          <div className="text-center md:hidden pt-8 pb-4 text-gray-400 text-xs">
            &copy; {new Date().getFullYear()} GymPilotPro.
          </div>
        </div>
      </div>
    </div>
  )
}
