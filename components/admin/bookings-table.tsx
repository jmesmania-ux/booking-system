'use client'

import React, { useState } from 'react'
import type { Booking, Service } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { DollarSign, Plus, X } from 'lucide-react'

// Status badge helper
const getStatusBadge = (status: string) => {
  switch(status) {
    case 'pending': return <Badge className="bg-amber-100 text-amber-800">Pending</Badge>
    case 'approved': return <Badge className="bg-green-100 text-green-800">Approved</Badge>
    case 'completed': return <Badge className="bg-emerald-100 text-emerald-800">Completed</Badge>
    case 'rejected': return <Badge className="bg-red-100 text-red-800">Rejected</Badge>
    default: return <Badge>{status}</Badge>
  }
}

// Default earnings per service type (matches new services)
const DEFAULT_SERVICE_EARNINGS = {
  'Swedish': 600,
  'Shiatsu': 600,
  'Thai': 600,
  'Combination': 600,
  'Ear Candling': 150,
  'Hot Stone': 200,
  'Ventusa': 200,
  'Fire Massage': 200
}

interface BookingsTableProps {
  bookings: (Booking & { users: { email: string } })[]
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  const [earningsInputs, setEarningsInputs] = useState<Record<string, number>>({})
  const [notesInputs, setNotesInputs] = useState<Record<string, string>>({})
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  
  // New: Add service dialog state
  const [showAddService, setShowAddService] = useState(false)
  const [newService, setNewService] = useState<{
    name: string
    defaultEarnings: number
    description: string
  }>({
    name: '',
    defaultEarnings: 0,
    description: ''
  })
  const [isAddingService, setIsAddingService] = useState(false)

  const supabase = createClient()

  // Initialize earnings inputs with defaults if available
  React.useEffect(() => {
    const initialInputs: Record<string, number> = {}
    const initialNotes: Record<string, string> = {}
    
    bookings.forEach(booking => {
      if (booking.earnings) initialInputs[booking.id] = booking.earnings
      if (booking.earnings_notes) initialNotes[booking.id] = booking.earnings_notes || ''
      if (!booking.earnings) initialInputs[booking.id] = DEFAULT_SERVICE_EARNINGS[booking.service as keyof typeof DEFAULT_SERVICE_EARNINGS] || 0
    })

    setEarningsInputs(initialInputs)
    setNotesInputs(initialNotes)
  }, [bookings])

  // Update earnings or notes
  const handleInputChange = (id: string, type: 'earnings' | 'notes', value: string | number) => {
    if (type === 'earnings') {
      setEarningsInputs(prev => ({ ...prev, [id]: Number(value) }))
    } else {
      setNotesInputs(prev => ({ ...prev, [id]: value as string }))
    }
  }

  // Mark booking as completed with earnings
  const completeBooking = async (id: string) => {
    if (earningsInputs[id] === undefined || earningsInputs[id] <= 0) {
      alert('Please enter valid earnings amount first!')
      return
    }

    setUpdatingId(id)
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'completed',
          earnings: earningsInputs[id],
          earnings_notes: notesInputs[id]
        })
        .eq('id', id)

      if (error) throw error
      window.location.reload()
    } catch (err) {
      console.error('Failed to complete booking:', err)
      alert('Error updating booking status')
    } finally {
      setUpdatingId(null)
    }
  }

  // Update booking status (approve/reject)
  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setUpdatingId(id)
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', id)

      if (error) throw error
      window.location.reload()
    } catch (err) {
      console.error('Failed to update status:', err)
      alert('Error updating booking status')
    } finally {
      setUpdatingId(null)
    }
  }

  // New: Add custom service to database
  const handleAddNewService = async () => {
    if (!newService.name.trim() || newService.defaultEarnings <= 0 || !newService.description.trim()) {
      alert('Please fill all fields with valid values!')
      return
    }

    setIsAddingService(true)
    try {
      // Create unique ID from service name
      const serviceId = newService.name.replace(/\s+/g, '_').toLowerCase()
      
      const { error } = await supabase
        .from('services') // Ensure this table exists in Supabase
        .insert({
          id: serviceId,
          name: newService.name,
          default_earnings: newService.defaultEarnings,
          description: newService.description
        })

      if (error) throw error
      setShowAddService(false)
      setNewService({ name: '', defaultEarnings: 0, description: '' })
      window.location.reload() // Refresh to load new service
    } catch (err) {
      console.error('Failed to add service:', err)
      alert('Error adding new service!')
    } finally {
      setIsAddingService(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* New: Add Service Button & Dialog Trigger */}
      <div className="flex justify-end items-center gap-2">
        <Button 
          variant="default" 
          size="sm" 
          onClick={() => setShowAddService(true)}
          className="gap-1"
        >
          <Plus className="h-4 w-4" /> Add New Service
        </Button>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Client</TableHead>
              <TableHead>Service</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Earnings (PHP)</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              bookings.map(booking => (
                <TableRow key={booking.id}>
                  <TableCell>
                    <div className="font-medium">{booking.name}</div>
                    <div className="text-sm text-muted-foreground">{booking.users.email}</div>
                  </TableCell>
                  <TableCell>{booking.service}</TableCell>
                  <TableCell>
                    <div>{new Date(booking.created_at).toLocaleDateString('en-PH')}</div>
                    <div className="text-sm text-muted-foreground">{booking.time}</div>
                  </TableCell>
                  <TableCell>{getStatusBadge(booking.status)}</TableCell>
                  <TableCell>
                    {booking.status === 'completed' ? (
                      <div className="font-medium">₱{(booking.earnings || 0).toLocaleString('en-PH')}</div>
                    ) : (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1">
                          <DollarSign size={16} />
                          <Input
                            type="number"
                            min="0"
                            value={earningsInputs[booking.id] || ''}
                            onChange={(e) => handleInputChange(booking.id, 'earnings', e.target.value)}
                            className="w-24 text-sm"
                          />
                        </div>
                        <Input
                          placeholder="Notes (optional)"
                          value={notesInputs[booking.id] || ''}
                          onChange={(e) => handleInputChange(booking.id, 'notes', e.target.value)}
                          className="w-full text-xs"
                        />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => updateStatus(booking.id, 'approved')}
                            disabled={updatingId === booking.id}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateStatus(booking.id, 'rejected')}
                            disabled={updatingId === booking.id}
                          >
                            Reject
                          </Button>
                        </>
                      )}
                      {booking.status === 'approved' && (
                        <Button
                          size="sm"
                          onClick={() => completeBooking(booking.id)}
                          disabled={updatingId === booking.id || !earningsInputs[booking.id]}
                        >
                          {updatingId === booking.id ? 'Processing...' : 'Complete'}
                        </Button>
                      )}
                      {booking.status === 'completed' && (
                        <Badge className="bg-emerald-100 text-emerald-800">Finalized</Badge>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* New: Add Service Dialog */}
      <Dialog open={showAddService} onOpenChange={setShowAddService}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Service</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="service-name">Service Name *</Label>
              <Input
                id="service-name"
                placeholder="e.g., Deep Tissue Massage"
                value={newService.name}
                onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-desc">Description *</Label>
              <Input
                id="service-desc"
                placeholder="Brief details for clients"
                value={newService.description}
                onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="service-earnings">Default Earnings (PHP) *</Label>
              <div className="flex items-center gap-1">
                <DollarSign size={16} />
                <Input
                  id="service-earnings"
                  type="number"
                  min="0"
                  placeholder="e.g., 300"
                  value={newService.defaultEarnings || ''}
                  onChange={(e) => setNewService(prev => ({ ...prev, defaultEarnings: Number(e.target.value) }))}
                  className="w-full"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddService(false)} disabled={isAddingService}>
              Cancel
            </Button>
            <Button onClick={handleAddNewService} disabled={isAddingService}>
              {isAddingService ? 'Adding...' : 'Save Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
