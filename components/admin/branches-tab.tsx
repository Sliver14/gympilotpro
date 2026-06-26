'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Edit2, Trash2, MapPin, Users, QrCode, Star, Check, Sparkles, Activity } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'
import { useGym } from '@/components/gym-provider'
import { BranchQRCode } from '@/components/branch-qr-code'

interface Branch {
  id: string
  name: string
  address?: string
  phone?: string
  manager?: string
  capacity?: number
  isActive: boolean
  isDefault: boolean
  memberCount: number
  trainerCount: number
  attendanceToday: number
}

export default function BranchesTab() {
  const { gymSlug, gymData } = useGym()
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // QR Modal State
  const [qrModalBranch, setQrModalBranch] = useState<Branch | null>(null)

  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    manager: '',
    capacity: 0,
    isDefault: false,
  })

  useEffect(() => {
    fetchBranches()
  }, [])

  const fetchBranches = async () => {
    setIsLoading(true)
    try {
      const res = await fetch('/api/admin/branches')
      const data = await res.json()
      if (res.ok) {
        setBranches(data.branches || [])
      }
    } catch (error) {
      toast.error('Failed to load branches')
    } finally {
      setIsLoading(false)
    }
  }

  const openModal = (branch?: Branch) => {
    if (branch) {
      setEditingBranch(branch)
      setForm({
        name: branch.name,
        address: branch.address || '',
        phone: branch.phone || '',
        manager: branch.manager || '',
        capacity: branch.capacity || 0,
        isDefault: branch.isDefault,
      })
    } else {
      setEditingBranch(null)
      setForm({ name: '', address: '', phone: '', manager: '', capacity: 0, isDefault: false })
    }
    setIsModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) {
      toast.error('Branch name is required')
      return
    }

    setIsSaving(true)
    try {
      const url = editingBranch 
        ? `/api/admin/branches/${editingBranch.id}` 
        : '/api/admin/branches'
      
      const method = editingBranch ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      if (res.ok) {
        toast.success(editingBranch ? 'Branch updated' : 'Branch created')
        setIsModalOpen(false)
        fetchBranches()
      } else {
        toast.error(data.error || 'Failed to save branch')
      }
    } catch (error) {
      toast.error('Something went wrong')
    } finally {
      setIsSaving(false)
    }
  }

  const handleSetDefault = async (branch: Branch) => {
    try {
      const res = await fetch(`/api/admin/branches/${branch.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...branch, isDefault: true }),
      })

      if (res.ok) {
        toast.success(`${branch.name} is now the default branch`)
        fetchBranches()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to set default branch')
      }
    } catch (error) {
      toast.error('Failed to update branch')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this branch?')) return

    try {
      const res = await fetch(`/api/admin/branches/${id}`, { method: 'DELETE' })
      const data = await res.json()

      if (res.ok) {
        toast.success('Branch deleted')
        fetchBranches()
      } else {
        toast.error(data.error || 'Failed to delete')
      }
    } catch (error) {
      toast.error('Failed to delete branch')
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-12"><Spinner className="h-8 w-8" /></div>
  }

  const accent = gymData?.primaryColor || '#daa857'

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter">Gym Branches</h2>
          <p className="text-sm text-muted-foreground">Manage multiple locations under one subscription</p>
        </div>
        <Button onClick={() => openModal()} style={{ backgroundColor: accent, color: '#000' }} className="hover:opacity-90">
          <Plus className="mr-2 h-4 w-4" /> Add New Branch
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {branches.map((branch) => (
          <Card key={branch.id} className="rounded-[2rem] overflow-hidden border border-border shadow-xl hover:shadow-2xl transition-all duration-300 relative group bg-card">
            {branch.isDefault && (
              <div className="absolute top-4 left-4 bg-[#daa857]/20 border border-[#daa857]/30 text-[#daa857] px-3 py-1 rounded-full text-[9px] font-black tracking-widest uppercase flex items-center gap-1 z-10">
                <Star className="h-3 w-3 fill-current" /> Default Branch
              </div>
            )}
            <CardHeader className="pb-4 pt-14">
              <CardTitle className="flex items-center justify-between">
                <span className="font-black text-lg truncate pr-2">{branch.name}</span>
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${branch.isActive ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-500'}`}>
                  {branch.isActive ? 'Active' : 'Inactive'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {branch.address && (
                <div className="flex items-start gap-2.5 text-xs text-muted-foreground">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <span className="line-clamp-2">{branch.address}</span>
                </div>
              )}
              
              {branch.phone && (
                <div className="text-xs text-muted-foreground">📞 {branch.phone}</div>
              )}

              {branch.manager && (
                <div className="text-xs">Manager: <span className="font-semibold">{branch.manager}</span></div>
              )}

              {/* Statistics Grid */}
              <div className="grid grid-cols-3 gap-2 bg-muted/40 p-3 rounded-2xl text-center border">
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Members</p>
                  <p className="text-base font-black text-foreground mt-0.5">{branch.memberCount}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Trainers</p>
                  <p className="text-base font-black text-foreground mt-0.5">{branch.trainerCount}</p>
                </div>
                <div>
                  <p className="text-[10px] font-black text-muted-foreground uppercase">Today</p>
                  <p className="text-base font-black text-foreground mt-0.5 flex items-center justify-center gap-0.5">
                    <Activity className="h-3.5 w-3.5 text-green-500" />
                    {branch.attendanceToday}
                  </p>
                </div>
              </div>

              {branch.capacity && branch.capacity > 0 ? (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Users className="h-4 w-4" />
                  Capacity: <span className="font-semibold text-foreground">{branch.capacity}</span>
                </div>
              ) : null}

              <div className="flex flex-col gap-2 pt-3 border-t border-border/50">
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 rounded-xl font-bold text-xs"
                    onClick={() => openModal(branch)}
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-1.5" /> Edit
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 rounded-xl font-bold text-xs"
                    onClick={() => setQrModalBranch(branch)}
                  >
                    <QrCode className="h-3.5 w-3.5 mr-1.5" /> QR Code
                  </Button>
                </div>

                <div className="flex gap-2">
                  {!branch.isDefault && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 rounded-xl font-bold text-xs"
                      onClick={() => handleSetDefault(branch)}
                    >
                      Set Default
                    </Button>
                  )}
                  
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="rounded-xl font-bold text-xs flex-shrink-0"
                    onClick={() => handleDelete(branch.id)}
                    disabled={branch.isDefault}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {branches.length === 0 && (
        <Card className="p-12 text-center rounded-[2rem] border border-dashed">
          <p className="text-muted-foreground">No branches yet. Create your first branch.</p>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md rounded-[2.5rem] bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter">
              {editingBranch ? 'Edit Branch' : 'Create New Branch'}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Enter the branch details to save location settings.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label className="text-xs font-bold">Branch Name *</Label>
              <Input 
                value={form.name} 
                onChange={(e) => setForm({...form, name: e.target.value})}
                placeholder="Lagos Mainland Branch"
                className="rounded-xl mt-1.5 h-11 bg-background border-border font-medium text-sm"
                required 
              />
            </div>

            <div>
              <Label className="text-xs font-bold">Address</Label>
              <Textarea 
                value={form.address} 
                onChange={(e) => setForm({...form, address: e.target.value})}
                placeholder="123 Fitness Avenue, Lagos"
                className="rounded-xl mt-1.5 bg-background border-border font-medium text-sm"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-bold">Phone</Label>
                <Input 
                  value={form.phone} 
                  onChange={(e) => setForm({...form, phone: e.target.value})}
                  placeholder="+234 801 234 5678"
                  className="rounded-xl mt-1.5 h-11 bg-background border-border font-medium text-sm"
                />
              </div>
              <div>
                <Label className="text-xs font-bold">Capacity</Label>
                <Input 
                  type="number"
                  value={form.capacity} 
                  onChange={(e) => setForm({...form, capacity: parseInt(e.target.value) || 0})}
                  className="rounded-xl mt-1.5 h-11 bg-background border-border font-medium text-sm"
                />
              </div>
            </div>

            <div>
              <Label className="text-xs font-bold">Manager Name</Label>
              <Input 
                value={form.manager} 
                onChange={(e) => setForm({...form, manager: e.target.value})}
                placeholder="John Doe"
                className="rounded-xl mt-1.5 h-11 bg-background border-border font-medium text-sm"
              />
            </div>

            <DialogFooter className="pt-4 gap-2 sm:gap-0 border-t border-border/50">
              <Button type="button" variant="outline" className="rounded-xl font-bold" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving} style={{ backgroundColor: accent, color: '#000' }} className="rounded-xl font-black">
                {isSaving ? 'Saving...' : editingBranch ? 'Update Branch' : 'Create Branch'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={!!qrModalBranch} onOpenChange={(open) => !open && setQrModalBranch(null)}>
        <DialogContent className="max-w-md rounded-[2.5rem] bg-card border-border text-foreground p-0 overflow-hidden">
          {qrModalBranch && (
            <BranchQRCode 
              branchId={qrModalBranch.id} 
              branchName={qrModalBranch.name} 
              gymSlug={gymSlug}
              gymData={gymData}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}