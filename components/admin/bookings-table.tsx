'use client'

import React, { useState, useEffect } from 'react'
import type { Booking, Service } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DollarSign, Plus, X, Package } from 'lucide-react'

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

// Add-On type definition
interface AddOn {
  id: string
  name: string
  price: number
  description: string
  is_active: boolean
}

export function BookingsTable({ bookings }: BookingsTableProps) {
  const [earningsInputs, setEarningsInputs] = useState<Record<string, number>>({})
  const [notesInputs, setNotesInputs] = useState<Record<string, string>>({})
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  
  // Add service dialog state
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

  // Add-on management states
  const [availableAddOns, setAvailableAddOns] = useState<AddOn[]>([])
  const [showAddOnDialog, setShowAddOnDialog] = useState(false)
  const [selectedBookingForAddOn, setSelectedBookingForAddOn] = useState<string | null>(null)
  const [selectedAddOnId, setSelectedAddOnId] = useState<string | null>(null)
  const [customAddOn, setCustomAddOn] = useState<{
    name: string
    price: number
    description: string
  }>({ name: '', price: 0, description: '' })
  const [isAddingAddOn, setIsAddingAddOn] = useState(false)
  const [useCustomAddOn, setUseCustomAddOn] = useState(false)

  const supabase = createClient()

  // Load available add-ons from Supabase
  useEffect(() => {
    const fetchAddOns = async () => {
      const { data, error } = await supabase
        .from('add_ons')
        .select('*')
        .eq('is_active', true)
      
      if (!error && data) setAvailableAddOns(data)
    }
    fetchAddOns()
  }, [supabase])

  // Initialize earnings/notes inputs
  useEffect(() => {
    const initialInputs: Record<string, number> = {}
    const initialNotes: Record<string, string> = {}
    
    bookings.forEach(booking => {
      const baseEarnings = booking.earnings || DEFAULT_SERVICE_EARNINGS[booking.service as keyof typeof DEFAULT_SERVICE_EARNINGS] || 0
      const addOnTotal = (booking.add_ons?.reduce((sum: number, addOn: any) => sum + addOn.price, 0) || 0)
      initialInputs[booking.id] = baseEarnings - addOnTotal
      initialNotes[booking.id] = booking.earnings_notes || ''
    })

    setEarningsInputs(initialInputs)
    setNotesInputs(initialNotes)
  }, [bookings, availableAddOns])

  // Update earnings or notes
  const handleInputChange = (id: string, type: 'earnings' | 'notes', value: string | number) => {
    if (type === 'earnings') {
      setEarningsInputs(prev => ({ ...prev, [id]: Number(value) }))
    } else {
      setNotesInputs(prev => ({ ...prev, [id]: value as string }))
    }
  }

  // Mark booking as completed
  const completeBooking = async (id: string) => {
    const booking = bookings.find(b => b.id === id)
    if (!booking) return

    const baseEarnings = earningsInputs[id] || DEFAULT_SERVICE_EARNINGS[booking.service as keyof typeof DEFAULT_SERVICE_EARNINGS] || 0
    const addOnTotal = (booking.add_ons?.reduce((sum: number, addOn: any) => sum + addOn.price, 0) || 0)
    const totalEarnings = baseEarnings + addOnTotal

    if (totalEarnings <= 0) {
      alert('Please enter valid earnings amount first!')
      return
    }

    setUpdatingId(id)
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          status: 'completed',
          earnings: totalEarnings,
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

  // Update booking status
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

  // Add new service
  const handleAddNewService = async () => {
    if (!newService.name.trim() || newService.defaultEarnings <= 0 || !newService.description.trim()) {
      alert('Please fill all fields with valid values!')
      return
    }

    setIsAddingService(true)
    try {
      const serviceId = newService.name.replace(/\s+/g, '_').toLowerCase()
      
      const { error } = await supabase
        .from('services')
        .insert({
          id: serviceId,
          name: newService.name,
          default_earnings: newService.defaultEarnings,
          description: newService.description
        })

      if (error) throw error
      setShowAddService(false)
      setNewService({ name: '', defaultEarnings: 0, description: '' })
      window.location.reload()
    } catch (err) {
      console.error('Failed to add service:', err)
      alert('Error adding new service!')
    } finally {
      setIsAddingService(false)
    }
  }

  // Add add-on to booking
  const handleAddAddOnToBooking = async () => {
    if (!selectedBookingForAddOn) return

    setIsAddingAddOn(true)
    try {
      let addOnData: any

      if (useCustomAddOn) {
        if (!customAddOn.name.trim() || customAddOn.price <= 0) {
          alert('Please fill valid custom add-on details!')
          return
        }
        addOnData = {
          name: customAddOn.name,
          price: customAddOn.price,
          description: customAddOn.description,
          is_custom: true
        }
      } else {
        const selectedAddOn = availableAddOns.find(a => a.id === selectedAddOnId)
        if (!selectedAddOn) {
          alert('Please select a valid add-on!')
          return
        }
        addOnData = {
          id: selectedAddOn.id,
          name: selectedAddOn.name,
          price: selectedAddOn.price,
          description: selectedAddOn.description,
          is_custom: false
        }
      }

      const booking = bookings.find(b => b.id === selectedBookingForAddOn)
      const currentAddOns = booking?.add_ons || []

      const { error } = await supabase
        .from('bookings')
        .update({
          add_ons: [...currentAddOns, addOnData],
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedBookingForAddOn)

      if (error) throw error
      setShowAddOnDialog(false)
      setSelectedBookingForAddOn(null)
      setSelectedAddOnId(null)
      setCustomAddOn({ name: '', price: 0, description: '' })
      setUseCustomAddOn(false)
      window.location.reload()
    } catch (err) {
      console.error('Failed to add add-on:', err)
      alert('Error adding add-on to booking!')
    } finally {
      setIsAddingAddOn(false)
    }
  }

  // Remove add-on from booking
  const handleRemoveAddOn = async (bookingId: string, addOnIndex: number) => {
    const booking = bookings.find(b => b.id === bookingId)
    if (!booking?.add_ons) return

    const updatedAddOns = booking.add_ons.filter((_, idx) => idx !== addOnIndex)
    
    try {
      const { error } = await supabase
        .from('bookings')
        .update({ add_ons: updatedAddOns })
        .eq('id', bookingId)

      if (error) throw error
      window.location.reload()
    } catch (err) {
      console.error('Failed to remove add-on:', err)
      alert('Error removing add-on!')
    }
  }

  return (
    <div className="space-y-4">
      {/* Add Service Button */}
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
              <TableHead>Add-Ons</TableHead>
              <TableHead>Date & Time</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Earnings (PHP)</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No bookings found
                </TableCell>
              </TableRow>
            ) : (
              bookings.map(booking => {
                const baseEarnings = earningsInputs[booking.id] || DEFAULT_SERVICE_EARNINGS[booking.service as keyof typeof DEFAULT_SERVICE_EARNINGS] || 0
                const addOnTotal = (booking.add_ons?.reduce((sum: number, addOn: any) => sum + addOn.price, 0) || 0)
                const totalEarnings = baseEarnings + addOnTotal

                return (
                  <TableRow key={booking.id}>
                    <TableCell>
                      <div className="font-medium">{booking.name}</div>
                      <div className="text-sm text-muted-foreground">{booking.users.email}</div>
                    </TableCell>
                    <TableCell>{booking.service}</TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {booking.add_ons && booking.add_ons.length > 0 ? (
                          booking.add_ons.map((addOn: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between gap-2 bg-muted/50 p-1 rounded text-sm">
                              <div>
                                <span className="font-medium">{addOn.name}</span> - ₱{addOn.price.toLocaleString('en-PH')}
                                {addOn.is_custom && <Badge className="ml-1 bg-blue-100 text-blue-800 text-xs">Custom</Badge>}
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-6 w-6 p-0"
                                onClick={() => handleRemoveAddOn(booking.id, idx)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          ))
                        ) : (
                          <span className="text-muted-foreground text-sm">No add-ons</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>{new Date(booking.created_at).toLocaleDateString('en-PH')}</div>
                      <div className="text-sm text-muted-foreground">{booking.time}</div>
                    </TableCell>
                    <TableCell>{getStatusBadge(booking.status)}</TableCell>
                    <TableCell>
                      {booking.status === 'completed' ? (
                        <div className="font-medium">₱{totalEarnings.toLocaleString('en-PH')}</div>
                      ) : (
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <DollarSign size={16} />
                            <Input
                              type="number"
                              min="0"
                              placeholder="Base amount"
                              value={baseEarnings || ''}
                              onChange={(e) => handleInputChange(booking.id, 'earnings', e.target.value)}
                              className="w-24 text-sm"
                            />
                          </div>
                          {booking.add_ons && booking.add_ons.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              + Add-ons: ₱{addOnTotal.toLocaleString('en-PH')}
                            </div>
                          )}
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
                      <div className="flex flex-wrap gap-2">
                        {/* Add Add-On Button */}
                        <Button
                          size="sm"
                          variant="secondary"
                          className="gap-1"
                          onClick={() => {
                            setSelectedBookingForAddOn(booking.id)
                            setShowAddOnDialog(true)
                          }}
                          disabled={booking.status === 'completed' || updatingId === booking.id}
                        >
                          <Package className="h-3 w-3" /> Add-On
                        </Button>

                        {/* Status Actions */}
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

        {/* Add-On Management Dialog */}
        <Dialog open={showAddOnDialog} onOpenChange={setShowAddOnDialog}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add Add-On</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {/* Add-On Type Toggle */}
              <div className="flex items-center gap-2 border-b pb-2">
                <Button
                  variant={!useCustomAddOn ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseCustomAddOn(false)}
                >
                  Use Existing Add-On
                </Button>
                <Button
                  variant={useCustomAddOn ? "default" : "outline"}
                  size="sm"
                  onClick={() => setUseCustomAddOn(true)}
                >
                  Create Custom Add-On
                </Button>
              </div>

              {/* Existing Add-On Selection */}
              {!useCustomAddOn && (
                <div className="space-y-3">
                  <Label htmlFor="addon-select">Select Add-On</Label>
                  <Select
                    value={selectedAddOnId || ""}
                    onValueChange={setSelectedAddOnId}
                  >
                    <SelectTrigger id="addon-select">
                      <SelectValue placeholder="Choose an add-on" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableAddOns.map((addOn) => (
                        <SelectItem key={addOn.id} value={addOn.id}>
                          {addOn.name} - ₱{addOn.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Custom Add-On Fields */}
              {useCustomAddOn && (
                <div className="space-y-3">
                  <Label htmlFor="custom-addon-name">Add-On Name</Label>
                  <Input
                    id="custom-addon-name"
                    value={customAddOn.name}
                    onChange={(e) => setCustomAddOn({...customAddOn, name: e.target.value})}
                    placeholder="e.g., Extra Massage Oil"
                  />

                  <Label htmlFor="custom-addon-price">Price (PHP)</Label>
                  <Input
                    id="custom-addon-price"
                    type="number"
                    min="0"
                    value={customAddOn.price || ""}
                    onChange={(e) => setCustomAddOn({...customAddOn, price: Number(e.target.value)})}
                    placeholder="Enter amount"
                  />

                  <Label htmlFor="custom-addon-desc">Description</Label>
                  <Input
                    id="custom-addon-desc"
                    value={customAddOn.description}
                    onChange={(e) => setCustomAddOn({...customAddOn, description: e.target.value})}
                    placeholder="Brief description"
                  />
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddOnDialog(false)}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleAddAddOnToBooking}
                disabled={isAddingAddOn || (!selectedAddOnId && !useCustomAddOn)}
              >
                {isAddingAddOn ? "Saving..." : "Add Add-On"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Add Service Dialog */}
        <Dialog open={showAddService} onOpenChange={setShowAddService}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Service</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="service-name">Service Name</Label>
                <Input
                  id="service-name"
                  value={newService.name}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  placeholder="e.g., Deep Tissue Massage"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-earnings">Default Earnings (PHP)</Label>
                <Input
                  id="service-earnings"
                  type="number"
                  min="0"
                  value={newService.defaultEarnings || ""}
                  onChange={(e) => setNewService({...newService, defaultEarnings: Number(e.target.value)})}
                  placeholder="Enter amount"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="service-desc">Description</Label>
                <Input
                  id="service-desc"
                  value={newService.description}
                  onChange={(e) => setNewService({...newService, description: e.target.value})}
                  placeholder="Brief service description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAddService(false)}>
                Cancel
              </Button>
              <Button
                variant="default"
                onClick={handleAddNewService}
                disabled={isAddingService || !newService.name || newService.defaultEarnings <= 0}
              >
                {isAddingService ? "Saving..." : "Save Service"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

