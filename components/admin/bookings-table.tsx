'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  X, Loader2, Calendar, Clock, User, CheckCircle2, XCircle, Info, ChevronDown, ChevronUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ADD_ON_OPTIONS = [
  { name: 'Ear Candling', price: 150, duration: 15 },
  { name: 'Ventusa', price: 150, duration: 15 },
  { name: 'Hot Stone', price: 150, duration: 15 },
  { name: 'Fire Massage', price: 150, duration: 15 }
]

interface BookingsTableProps {
  bookings: any[]
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onComplete: (id: string, finalEarnings: number) => void
}

export function BookingsTable({ bookings, onApprove, onReject, onComplete }: BookingsTableProps) {
  const router = useRouter()
  const supabase = createClient()
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [earningsInputs, setEarningsInputs] = useState<Record<string, number>>({})

  useEffect(() => {
    const initialInputs: Record<string, number> = {}
    bookings.forEach(b => { 
      initialInputs[b.id] = b.earnings || b.total_price || 0 
    })
    setEarningsInputs(initialInputs)
  }, [bookings])

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  // --- DATABASE UPDATE FUNCTIONS ---
  const addExtraService = async (e: React.MouseEvent, booking: any, addOn: typeof ADD_ON_OPTIONS[0]) => {
    e.stopPropagation()
    setUpdatingId(booking.id)
    const currentAddOns = Array.isArray(booking.add_ons) ? booking.add_ons : []
    const updatedAddOns = [...currentAddOns, { name: addOn.name, price: addOn.price, duration_minutes: addOn.duration }]
    const newTotal = (booking.total_price || 0) + addOn.price
    
    const { error } = await supabase.from('bookings').update({ 
      add_ons: updatedAddOns, total_price: newTotal, earnings: newTotal 
    }).eq('id', booking.id)

    if (!error) {
      setEarningsInputs(prev => ({ ...prev, [booking.id]: newTotal }))
      router.refresh()
    }
    setUpdatingId(null)
  }

  const removeAddOn = async (e: React.MouseEvent, booking: any, indexToRemove: number) => {
    e.stopPropagation()
    setUpdatingId(booking.id)
    const currentAddOns = [...booking.add_ons]
    const removedItem = currentAddOns[indexToRemove]
    currentAddOns.splice(indexToRemove, 1)
    const newTotal = Math.max(0, (booking.total_price || 0) - (removedItem.price || 0))
    
    const { error } = await supabase.from('bookings').update({
      add_ons: currentAddOns, total_price: newTotal, earnings: newTotal
    }).eq('id', booking.id)

    if (!error) {
      setEarningsInputs(prev => ({ ...prev, [booking.id]: newTotal }))
      router.refresh()
    }
    setUpdatingId(null)
  }

  return (
    /* Widened the container by reducing side padding */
    <div className="flex flex-col gap-3 pb-24 px-2 sm:px-4">
      {bookings.map(booking => {
        const isExpanded = expandedId === booking.id
        const status = booking.status?.toLowerCase() || 'pending'
        
        return (
          <Card key={booking.id} className="border-none shadow-sm ring-1 ring-slate-100 rounded-3xl overflow-hidden">
            <CardContent className="p-0">
              {/* Main Header Row - MATCHES CLIENT LIST STYLE */}
              <div 
                className="p-4 flex items-center justify-between cursor-pointer active:bg-slate-50 transition-colors"
                onClick={() => toggleExpand(booking.id)}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <User className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-[15px] truncate">
                      {booking.service}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-medium">
                      {booking.name} • {booking.date ? format(parseISO(`${booking.date}T00:00:00`), 'MMM d') : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-bold uppercase border-none",
                    status === 'pending' ? "bg-amber-100 text-amber-600" : 
                    status === 'approved' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"
                  )}>
                    {status}
                  </Badge>
                  {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-300" /> : <ChevronDown className="h-5 w-5 text-slate-300" />}
                </div>
              </div>

              {/* Expanded Details Section */}
              {isExpanded && (
                <div className="px-4 pb-6 pt-2 bg-white border-t border-slate-50 space-y-5">
                  <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-2xl">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-bold text-slate-700">{booking.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-emerald-500" />
                      <span className="text-sm font-bold text-slate-700">
                        {booking.date ? format(parseISO(`${booking.date}T00:00:00`), 'EEEE') : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3 px-1">
                    <div className="flex items-center gap-2">
                      <Info className="h-3 w-3 text-emerald-500" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Add-ons</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(!booking.add_ons || booking.add_ons.length === 0) ? (
                        <span className="text-xs font-medium text-slate-400 italic">No add-ons</span>
                      ) : (
                        booking.add_ons.map((ao: any, i: number) => (
                          <Badge key={i} className="bg-emerald-50 text-emerald-700 border-none font-bold text-[10px] px-3 py-1 rounded-xl flex items-center gap-2">
                            {ao.name}
                            {status === 'approved' && (
                              <X className="h-3 w-3 cursor-pointer" onClick={(e) => removeAddOn(e, booking, i)} />
                            )}
                          </Badge>
                        ))
                      )}
                    </div>
                    
                    {status === 'approved' && (
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
                        {ADD_ON_OPTIONS.map(opt => (
                          <button 
                            key={opt.name} 
                            onClick={(e) => addExtraService(e, booking, opt)}
                            className="text-[10px] px-2.5 py-1.5 rounded-lg border border-slate-200 font-bold text-slate-500 hover:bg-emerald-50"
                          >
                            + {opt.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Actions Footer */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-50 px-1">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase">Price</span>
                      <div className="flex items-center">
                        <span className="text-emerald-600 font-bold text-lg mr-1">₱</span>
                        <Input 
                          type="number"
                          className="w-20 h-8 font-bold text-xl border-none bg-transparent p-0 focus-visible:ring-0"
                          value={earningsInputs[booking.id] || ''}
                          onChange={(e) => setEarningsInputs({...earningsInputs, [booking.id]: Number(e.target.value)})}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {status === 'pending' && (
                        <>
                          <Button variant="ghost" className="text-red-500 font-bold h-10 px-4" 
                            onClick={(e) => { e.stopPropagation(); onReject(booking.id); }}>
                            Reject
                          </Button>
                          <Button className="bg-slate-900 rounded-xl h-10 px-6 font-bold" 
                            onClick={(e) => { e.stopPropagation(); onApprove(booking.id); }}>
                            Approve
                          </Button>
                        </>
                      )}
                      {status === 'approved' && (
                        <Button className="bg-emerald-600 rounded-xl h-10 px-8 font-bold shadow-md" 
                          onClick={(e) => { e.stopPropagation(); onComplete(booking.id, earningsInputs[booking.id]); }}>
                          Finish
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
