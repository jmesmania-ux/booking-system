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
  { name: 'Ear Candling', price: 150 },
  { name: 'Ventusa', price: 150 },
  { name: 'Hot Stone', price: 150 },
  { name: 'Fire Massage', price: 150 }
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

  // --- CRITICAL FIX: Stop Propagation ensures buttons work instead of just toggling the card ---
  const handleAction = (e: React.MouseEvent, action: () => void) => {
    e.preventDefault();
    e.stopPropagation();
    action();
  };

  const addExtraService = async (e: React.MouseEvent, booking: any, addOn: any) => {
    e.stopPropagation();
    setUpdatingId(booking.id)
    const currentAddOns = Array.isArray(booking.add_ons) ? booking.add_ons : []
    const updatedAddOns = [...currentAddOns, { name: addOn.name, price: addOn.price }]
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

  return (
    <div className="flex flex-col gap-2 pb-24 px-0"> {/* Width: px-0 makes tiles wider */}
      {bookings.map(booking => {
        const isExpanded = expandedId === booking.id
        const status = booking.status?.toLowerCase() || 'pending'
        
        return (
          <Card key={booking.id} className="border-none shadow-sm ring-1 ring-slate-100 rounded-2xl overflow-hidden mx-2">
            <CardContent className="p-0">
              {/* Header: Reduced height by changing p-4 to py-3 */}
              <div 
                className="py-3 px-4 flex items-center justify-between cursor-pointer active:bg-slate-50"
                onClick={() => setExpandedId(isExpanded ? null : booking.id)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <User className="h-5 w-5 text-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm truncate leading-tight">
                      {booking.service}
                    </h3>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-tight">
                      {booking.name} • {booking.date ? format(parseISO(`${booking.date}T00:00:00`), 'MMM d') : ''}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={cn(
                    "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border-none",
                    status === 'pending' ? "bg-amber-100 text-amber-600" : "bg-emerald-100 text-emerald-600"
                  )}>
                    {status}
                  </Badge>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-300" /> : <ChevronDown className="h-4 w-4 text-slate-300" />}
                </div>
              </div>

              {/* Expanded Area */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-1 bg-white border-t border-slate-50 space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center gap-2 py-2 px-3 bg-slate-50 rounded-xl">
                      <Clock className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-xs font-bold text-slate-700">{booking.time}</span>
                    </div>
                    <div className="flex items-center gap-2 py-2 px-3 bg-slate-50 rounded-xl">
                      <Calendar className="h-3.5 w-3.5 text-emerald-500" />
                      <span className="text-xs font-bold text-slate-700">
                        {booking.date ? format(parseISO(`${booking.date}T00:00:00`), 'EEEE') : ''}
                      </span>
                    </div>
                  </div>

                  {/* Add-ons List */}
                  {status === 'approved' && (
                    <div className="flex flex-wrap gap-1.5">
                      {ADD_ON_OPTIONS.map(opt => (
                        <button 
                          key={opt.name} 
                          onClick={(e) => addExtraService(e, booking, opt)}
                          className="text-[9px] px-2 py-1 rounded-lg border border-slate-100 font-bold text-slate-500 active:bg-emerald-50"
                        >
                          + {opt.name}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold text-slate-400 uppercase">Earnings</span>
                      <div className="flex items-center">
                        <span className="text-emerald-600 font-bold mr-0.5 text-sm">₱</span>
                        <Input 
                          type="number"
                          className="w-16 h-6 font-bold text-lg border-none bg-transparent p-0 focus-visible:ring-0"
                          value={earningsInputs[booking.id] || ''}
                          onChange={(e) => setEarningsInputs({...earningsInputs, [booking.id]: Number(e.target.value)})}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {status === 'pending' && (
                        <>
                          <Button variant="ghost" className="text-red-500 font-bold h-9 px-3 text-xs" 
                            onClick={(e) => handleAction(e, () => onReject(booking.id))}>
                            Reject
                          </Button>
                          <Button className="bg-slate-900 rounded-xl h-9 px-5 font-bold text-xs" 
                            onClick={(e) => handleAction(e, () => onApprove(booking.id))}>
                            Approve
                          </Button>
                        </>
                      )}
                      {status === 'approved' && (
                        <Button className="bg-emerald-600 rounded-xl h-9 px-8 font-bold text-xs shadow-md" 
                          onClick={(e) => handleAction(e, () => onComplete(booking.id, earningsInputs[booking.id]))}>
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
