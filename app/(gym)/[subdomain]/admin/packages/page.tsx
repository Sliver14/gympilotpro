'use client'

import { useEffect, useState, Suspense, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/admin-sidebar'
import { AdminMobileNav } from '@/components/admin/admin-mobile-nav'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Edit2, Trash2, Plus, Loader2 } from 'lucide-react'

function AdminPackagesContent() {
  const [adminData, setAdminData] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [packages, setPackages] = useState<any[]>([])
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  const [form, setForm] = useState({
    name: '',
    duration: '',
    price: '',
    description: ''
  })
  
  const router = useRouter()

  const fetchAdminData = useCallback(async () => {
    setIsLoading(true)
    try {
      const userResponse = await fetch('/api/auth/user')
      if (!userResponse.ok) return router.push('/login')

      const userData = await userResponse.json()
      if (!['admin', 'owner'].includes(userData.role)) {
        return router.push('/member/dashboard')
      }
      setAdminData(userData)
      
      const pkgRes = await fetch('/api/admin/packages')
      if (pkgRes.ok) {
        const data = await pkgRes.json()
        setPackages(data.packages)
      }
    } catch (error) {
      toast.error('Failed to load data')
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchAdminData()
  }, [fetchAdminData])

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const openModal = (pkg?: any) => {
    if (pkg) {
      setEditingId(pkg.id)
      setForm({
        name: pkg.name.split(' - ')[0], // Strip the appended ID
        duration: pkg.duration.toString(),
        price: pkg.price.toString(),
        description: pkg.description
      })
    } else {
      setEditingId(null)
      setForm({ name: '', duration: '', price: '', description: '' })
    }
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const url = editingId ? `/api/admin/packages/${editingId}` : '/api/admin/packages'
      const method = editingId ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast.success(`Package ${editingId ? 'updated' : 'created'} successfully`)
      setIsModalOpen(false)
      fetchAdminData() // Refresh list
    } catch (error: any) {
      toast.error(error.message || 'Failed to save package')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this package?')) return
    
    try {
      const res = await fetch(`/api/admin/packages/${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      
      toast.success('Package deleted')
      setPackages(packages.filter(p => p.id !== id))
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete package')
    }
  }

  if (isLoading || !adminData) {
    return <div className="flex min-h-screen items-center justify-center"><Spinner className="h-8 w-8 text-[#daa857]" /></div>
  }

  return (
    <SidebarProvider>
      <AdminSidebar adminData={adminData} onLogout={handleLogout} />
      <SidebarInset className="bg-background">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b border-border px-6 sticky top-0 z-30 bg-card/50 backdrop-blur-md">
          <SidebarTrigger className="-ml-1" />
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-black uppercase italic tracking-[0.2em] text-muted-foreground">
              Admin <span className="text-[#daa857]">Packages</span>
            </h1>
          </div>
        </header>
        
        <div className="flex flex-1 flex-col gap-8 p-6 md:p-10 pb-24 md:pb-20">
          <div className="max-w-6xl mx-auto w-full space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-black uppercase italic tracking-tighter text-foreground">Membership Plans</h2>
              <Button onClick={() => openModal()} className="bg-[#daa857] hover:bg-[#cdb48b] text-black font-black uppercase tracking-widest rounded-xl">
                <Plus className="mr-2 h-4 w-4" /> New Package
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {packages.map((pkg) => (
                <Card key={pkg.id} className="bg-card border-border shadow-xl rounded-[2rem] overflow-hidden">
                  <CardHeader className="bg-card/50 border-b border-border p-6">
                    <CardTitle className="text-xl font-black uppercase italic tracking-tighter text-foreground">
                      {pkg.name.split(' - ')[0]}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-4">
                    <div>
                      <span className="text-3xl font-black italic text-[#daa857]">₦{pkg.price.toLocaleString()}</span>
                    </div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Duration: {pkg.duration} Days</p>
                    <p className="text-sm text-muted-foreground mt-4">{pkg.description}</p>
                    
                    <div className="flex gap-3 pt-4 border-t border-border mt-4">
                      <Button onClick={() => openModal(pkg)} variant="outline" className="flex-1 bg-transparent border-border hover:bg-accent text-muted-foreground">
                        <Edit2 className="h-4 w-4 mr-2" /> Edit
                      </Button>
                      <Button onClick={() => handleDelete(pkg.id)} variant="destructive" className="flex-1 bg-red-900/20 text-red-500 hover:bg-red-900/40 hover:text-red-400">
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {packages.length === 0 && (
                <div className="col-span-full text-center p-12 text-muted-foreground uppercase tracking-widest font-bold">
                  No packages found. Create one to get started.
                </div>
              )}
            </div>
          </div>
        </div>
        <AdminMobileNav role={adminData.role} />
      </SidebarInset>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-card border-border text-foreground rounded-[2.5rem] p-8 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase italic tracking-tighter text-foreground">
              {editingId ? 'Edit' : 'Create'} <span className="text-[#daa857]">Package</span>
            </DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSave} className="space-y-6 mt-4">
            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Plan Name</Label>
              <Input 
                value={form.name}
                onChange={e => setForm({...form, name: e.target.value})}
                required
                className="h-14 bg-background border-border rounded-xl font-bold uppercase tracking-widest text-xs"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Duration (Days)</Label>
                <Input 
                  type="number"
                  value={form.duration}
                  onChange={e => setForm({...form, duration: e.target.value})}
                  required
                  min="1"
                  className="h-14 bg-background border-border rounded-xl font-bold tracking-widest text-xs"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Price (₦)</Label>
                <Input 
                  type="number"
                  value={form.price}
                  onChange={e => setForm({...form, price: e.target.value})}
                  required
                  min="0"
                  className="h-14 bg-background border-border rounded-xl font-bold tracking-widest text-xs"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Description</Label>
              <Textarea 
                value={form.description}
                onChange={e => setForm({...form, description: e.target.value})}
                required
                className="bg-background border-border rounded-xl font-bold tracking-widest text-xs min-h-[100px]"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="hover:bg-accent hover:text-foreground text-muted-foreground">
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} className="bg-[#daa857] hover:bg-[#cdb48b] text-black font-black uppercase tracking-widest rounded-xl px-8">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Package'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  )
}

export default function AdminPackages() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Spinner className="h-8 w-8 text-primary" /></div>}>
      <AdminPackagesContent />
    </Suspense>
  )
}
