'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Edit2, Trash2, MapPin, Users } from 'lucide-react'
import { Spinner } from '@/components/ui/spinner'

interface Branch {
  id: string
  name: string
  address?: string
  phone?: string
  manager?: string
  capacity?: number
  isActive: boolean
}

export default function BranchesTab() {
  const [branches, setBranches] = useState<Branch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const [form, setForm] = useState({
    name: '',
    address: '',
    phone: '',
    manager: '',
    capacity: 0,
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
        setBranches(data.branches)
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
      })
    } else {
      setEditingBranch(null)
      setForm({ name: '', address: '', phone: '', manager: '', capacity: 0 })
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-tighter">Gym Branches</h2>
          <p className="text-sm text-muted-foreground">Manage multiple locations under one subscription</p>
        </div>
        <Button onClick={() => openModal()} className="bg-[#daa857] hover:bg-[#cdb48b] text-black">
          <Plus className="mr-2 h-4 w-4" /> Add New Branch
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {branches.map((branch) => (
          <Card key={branch.id} className="rounded-[2rem] overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center justify-between">
                <span>{branch.name}</span>
                <span className={`text-xs px-3 py-1 rounded-full ${branch.isActive ? 'bg-green-500/10 text-green-600' : 'bg-gray-500/10 text-gray-500'}`}>
                  {branch.isActive ? 'Active' : 'Inactive'}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {branch.address && (
                <div className="flex items-start gap-3 text-sm">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                  <span>{branch.address}</span>
                </div>
              )}
              
              {branch.phone && (
                <div className="text-sm text-muted-foreground">📞 {branch.phone}</div>
              )}

              {branch.manager && (
                <div className="text-sm">Manager: <span className="font-medium">{branch.manager}</span></div>
              )}

              {branch.capacity && branch.capacity > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4" />
                  Capacity: <span className="font-medium">{branch.capacity}</span>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => openModal(branch)}
                >
                  <Edit2 className="h-4 w-4 mr-2" /> Edit
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="flex-1"
                  onClick={() => handleDelete(branch.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {branches.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">No branches yet. Create your first branch.</p>
        </Card>
      )}

      {/* Create/Edit Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md rounded-[2rem]">
          <DialogHeader>
            <DialogTitle>
              {editingBranch ? 'Edit Branch' : 'Create New Branch'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-6">
            <div>
              <Label>Branch Name *</Label>
              <Input 
                value={form.name} 
                onChange={(e) => setForm({...form, name: e.target.value})}
                placeholder="Lagos Mainland Branch"
                required 
              />
            </div>

            <div>
              <Label>Address</Label>
              <Textarea 
                value={form.address} 
                onChange={(e) => setForm({...form, address: e.target.value})}
                placeholder="123 Fitness Avenue, Lagos"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input 
                  value={form.phone} 
                  onChange={(e) => setForm({...form, phone: e.target.value})}
                  placeholder="+234 801 234 5678"
                />
              </div>
              <div>
                <Label>Capacity</Label>
                <Input 
                  type="number"
                  value={form.capacity} 
                  onChange={(e) => setForm({...form, capacity: parseInt(e.target.value) || 0})}
                />
              </div>
            </div>

            <div>
              <Label>Manager Name</Label>
              <Input 
                value={form.manager} 
                onChange={(e) => setForm({...form, manager: e.target.value})}
                placeholder="John Doe"
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Saving...' : editingBranch ? 'Update Branch' : 'Create Branch'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}