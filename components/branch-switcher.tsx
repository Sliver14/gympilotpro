'use client'

import { useState, useEffect } from 'react'
import { useGym } from '@/components/gym-provider'
import { Check, ChevronDown, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'

interface Branch {
  id: string
  name: string
  isActive: boolean
}

export function BranchSwitcher() {
  const { gymData, selectedBranch, setSelectedBranch } = useGym()
  const [branches, setBranches] = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)

  const isElite = gymData?.subscriptions?.[0]?.plan === 'elite'
  const currentBranch = branches.find(b => b.id === selectedBranch)

  useEffect(() => {
    if (isElite) {
      fetchBranches()
    } else {
      setLoading(false)
    }
  }, [isElite])

  const fetchBranches = async () => {
    try {
      const res = await fetch('/api/admin/branches')
      if (res.ok) {
        const data = await res.json()
        setBranches(data.branches || [])

        // Auto-select first branch if none active and only one exists
        if (!selectedBranch && data.branches?.length === 1) {
          setSelectedBranch(data.branches[0].id)
        }
      }
    } catch (error) {
      console.error('Failed to fetch branches')
    } finally {
      setLoading(false)
    }
  }

  const handleBranchChange = (branchId: string) => {
    setSelectedBranch(branchId)
    if (branchId === 'all') {
      toast.success('Switched to Combined View')
    } else {
      toast.success(`Switched to ${branches.find(b => b.id === branchId)?.name}`)
    }
    // Refresh page to load new branch-aware statistics
    window.location.reload()
  }

  if (!isElite || loading || branches.length <= 1) {
    return null // Don't show switcher if not Elite or only one branch
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 border-border hover:bg-accent">
          <Building2 className="h-4 w-4" />
          <span className="font-medium truncate max-w-[180px]">
            {selectedBranch === 'all' ? 'All Branches' : (currentBranch?.name || 'Select Branch')}
          </span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuItem
          onClick={() => handleBranchChange('all')}
          className="font-medium"
        >
          🌐 All Branches (Combined View)
        </DropdownMenuItem>

        {branches.map((branch) => (
          <DropdownMenuItem
            key={branch.id}
            onClick={() => handleBranchChange(branch.id)}
            className="flex items-center justify-between"
          >
            <span>{branch.name}</span>
            {selectedBranch === branch.id && <Check className="h-4 w-4" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}