'use client'

import React, { useState, useEffect } from 'react'
import type { Booking } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter 
} from '@/components/ui/dialog'
import { DollarSign, Plus, X, Loader2, MessageCircle } from 'lucide-react'

// Configuration for Admin Quick-Add services
const ADD_ON_OPTIONS = [
  { name: 'Ear Candling', price: 150, duration: 15 },
  { name: 'Ventusa', price: 200, duration: 15 },
  { name: 'Hot Stone', price: 200, duration: 15 },
  { name: 'Fire Massage', price: 200, duration: 15 }
]

const getStatusBadge = (status: string) => {
  switch(status) {
    case 'pending': return <Badge className="bg-amber-100 text-amber-800 border-none">Pending</Badge>
    case 'approved': return <Badge className="bg-green-100 text-green-800 border-none">Approved</Badge>
    case 'completed': return <Badge className="bg-emerald-100 text-emerald-800 border-none">Completed</Badge>
    case 'rejected': return <Badge className="bg-red-100 text-red-800 border-none">Rejected</Badge>
    default: return <Badge className="border-none">{status}</Badge>
  }
}

interface BookingsTableProps {
  bookings: (Booking & { users: { email: string } })[]
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  const router = useRouter()
  const supabase = createClient()
  
  const [earningsInputs, setEarningsInputs] = useState<Record<string, number>>({})
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  
  // Dialog States
  const [showAddService, setShowAddService] = useState(false)
  const [newService, setNewService] = useState({ name: '', defaultEarnings: 0, description: '' })
  const [isAddingService, setIsAddingService] = useState(false)

  // Initialize prices based on current database state
  useEffect(() => {
    const initialInputs: Record<string, number> = {}
    bookings.forEach(b => {
      initialInputs[b.id] = b.total_price || b.earnings || 0
    })
    setEarningsInputs(initialInputs)
  }, [bookings])

  // --- ADD EXTRA SERVICE ---
  const addExtraService = async (booking: any, addOn: typeof ADD_ON_OPTIONS[0]) => {
    setUpdatingId(booking.id)
    try {
      const currentAddOns = Array.isArray(booking.add_ons) ? booking.add_ons : []
      const updatedAddOns = [...currentAddOns, { 
        name: addOn.name, 
        price: addOn.price, 
        duration_minutes: addOn.duration 
      }]
      
      const newTotal = (earningsInputs[booking.id] || 0) + addOn.price
      const newDuration = (booking.duration || 60) + addOn.duration

      const { error } = await supabase
        .from('bookings')
        .update({ 
          add_ons: updatedAddOns,
          total_price: newTotal,
          duration: newDuration
        })
        .eq('id', booking.id)

      if (error) throw error
      router.refresh()
    } catch (err) {
      console.error(err)
      alert("Error adding service")
    } finally {
      setUpdatingId(null)
    }
  }

  // --- DELETE ADD-ON ---
  const deleteAddOn = async (booking: any, indexToDelete: number) => {
    setUpdatingId(booking.id)
    try {
      const currentAddOns = [...booking.add_ons]
      const removedItem = currentAddOns[indexToDelete]
      currentAddOns.splice(indexToDelete, 1)

      const newTotal = (earningsInputs[booking.id] || 0) - (removedItem.price || 0)
      const newDuration = (booking.duration || 60) - (removedItem.duration_minutes || 15)

      const { error } = await supabase
        .from('bookings')
        .update({ 
          add_ons: currentAddOns,
          total_price: Math.max(0, newTotal),
          duration: Math.max(60, newDuration) 
        })
        .eq('id', booking.id)

      if (error) throw error
      router.refresh()
    } catch (err) {
      console.error(err)
      alert("Error removing service")
    } finally {
      setUpdatingId(null)
    }
  }

  const completeBooking = async (id: string) => {
    setUpdatingId(id)
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'completed',
          earnings: earningsInputs[id] // Finalize with current input amount
        })
        .eq('id', id)

      if (error) throw error
      router.refresh()
    } catch (err) {
      alert("Error completing booking")
    } finally {
      setUpdatingId(null)
    }
  }

  const updateStatus = async (id: string, status: 'approved' | 'rejected') => {
    setUpdatingId(id)
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
    if (!error) router.refresh()
    setUpdatingId(null)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="default" size="sm" onClick={() => setShowAddService(true)} className="gap-1">
          <Plus className="h-4 w-4" /> Add New Service
        </Button>
      </div>

      <div className="overflow-x-auto border rounded-2xl bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="font-bold">Client & Service</TableHead>
              <TableHead className="font-bold">Schedule</TableHead>
              <TableHead className="font-bold">Add-ons (Quick Add)</TableHead>
              <TableHead className="font-bold">Total (PHP)</TableHead>
              <TableHead className="font-bold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No bookings found</TableCell></TableRow>
            ) : (
              bookings.map(booking => (
                <TableRow key={booking.id} className="hover:bg-muted/10 transition-colors">
                  <TableCell>
                    <div className="font-bold text-md">{booking.service}</div>
                    <div className="text-xs text-muted-foreground">{booking.name} • {booking.duration || 60} mins</div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="text-sm font-medium">
                      {booking.date ? format(parseISO(`${booking.date}T00:00:00`), 'MMM dd, yyyy') : 'N/A'}
                    </div>
                    <div className="text-xs text-muted-foreground">{booking.time}</div>
                  </TableCell>

                  <TableCell className="max-w-[280px]">
                    <div className="flex flex-wrap gap-1 mb-2">
                      {booking.add_ons?.map((ao: any, i: number) => (
                        <Badge key={i} variant="secondary" className="pl-2 pr-1 py-0.5 flex items-center gap-1 group">
                          {ao.name}
                          <button onClick={() => deleteAddOn(booking, i)} className="hover:text-red-500 rounded-full transition-colors">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    {booking.status !== 'completed' && (
                      <div className="flex flex-wrap gap-1">
                        {ADD_ON_OPTIONS.map(opt => (
                          <Button 
                            key={opt.name}
                            variant="outline" 
                            className="h-6 text-[9px] px-2 border-dashed rounded-full"
                            onClick={() => addExtraService(booking, opt)}
                            disabled={updatingId === booking.id}
                          >
                            + {opt.name}
                          </Button>
                        ))}
                      </div>
                    )}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-bold text-green-600">₱</span>
                      <Input 
                        type="number"
                        value={earningsInputs[booking.id] || ''}
                        onChange={(e) => setEarningsInputs({...earningsInputs, [booking.id]: Number(e.target.value)})}
                        className="w-24 h-8 font-bold text-green-700"
                      />
                    </div>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => updateStatus(booking.id, 'approved')} disabled={updatingId === booking.id}>Approve</Button>
                          <Button size="sm" variant="destructive" onClick={() => updateStatus(booking.id, 'rejected')} disabled={updatingId === booking.id}>Reject</Button>
                        </>
                      )}
                      {booking.status === 'approved' && (
                        <Button 
                          size="sm" 
                          className="bg-green-600 hover:bg-green-700 h-8"
                          onClick={() => completeBooking(booking.id)}
                          disabled={updatingId === booking.id}
                        >
                          {updatingId === booking.id ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Complete'}
                        </Button>
                      )}
                      {booking.status === 'completed' && <Badge className="bg-blue-100 text-blue-700 border-none">Finalized</Badge>}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Service Dialog */}
      <Dialog open={showAddService} onOpenChange={setShowAddService}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Service</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y
