'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { 
  User, Info, ChevronDown, ChevronUp, Timer
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
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [earningsInputs, setEarningsInputs] = useState<Record<string, number>>({})

  useEffect(() => {
    const initialInputs: Record<string, number> = {}
    bookings.forEach(b => { 
      initialInputs[b.id] = b.earnings || b.total_price || 0 
    })
    setEarningsInputs(initialInputs)
  }, [bookings])

  return (
    <div className="flex flex-col gap-3 pb-24 w-full px-2">
      {bookings.map(booking => {
        const isExpanded = expandedId === booking.id
        const status = booking.status?.toLowerCase() || 'pending'
        
        return (
          <Card key={booking.id} className="border border-slate-100 shadow-sm rounded-3xl overflow-hidden w-full bg-white">
            <CardContent className="p-0">
              {/* Main Tile - Matches Client List Header */}
              <div 
                className="py-4 px-5 flex items-center justify-between cursor-pointer active:bg-slate-50 transition-colors"
                onClick={() => setExpandedId(isExpanded ? null : booking.id)}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                    <User className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-slate-800 text-lg leading-tight truncate">
                      {booking.service}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">
                      {booking.name} • {booking.date ? format(parseISO(`${booking.date}T00:00:00`), 'MMM d') : ''}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={cn(
                    "px-3 py-1 rounded-lg text-[9px] font-black uppercase border-none tracking-wider",
                    status === 'pending' ? "bg-amber-100 text-amber-600" : 
                    status === 'approved' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-500"
                  )}>
                    {status}
                  </Badge>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-300" /> : <ChevronDown className="h-4 w-4 text-slate-300" />}
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="px-5 pb-6 pt-2 space-y-5 bg-white border-t border-slate-50 animate-in fade-in slide-in-from-top-1">
                  
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Pressure</span>
                      <p className="text-sm font-bold text-slate-700">{booking.pressure_preference || 'Medium'}</p>
                    </div>
                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block mb-1">Focus Area</span>
                      <p className="text-sm font-bold text-slate-700">{booking.focus_area || 'Full Body'}</p>
                    </div>
                  </div>

                  {/* Active Services */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Active Services</span>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-white text-slate-600 border border-slate-100 font-bold text-[11px] px-3 py-1.5 rounded-xl shadow-sm">
                        {booking.service} ({booking.duration}m)
                      </Badge>
                      {booking.add_ons?.map((ao: any, i: number) => (
                        <Badge key={i} className="bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-[11px] px-3 py-1.5 rounded-xl">
                          {ao.name} (+₱{ao.price})
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="flex items-center justify-between pt-5 border-t border-slate-100">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">Earnings</span>
                      <div className="flex items-center">
                        <span className="text-slate-900 font-black text-2xl mr-0.5">₱</span>
                        <Input 
                          type="number"
                          className="w-20 h-9 font-black text-2xl border-none bg-transparent p-0 focus-visible:ring-0 text-slate-900"
                          value={earningsInputs[booking.id] || ''}
                          onChange={(e) => setEarningsInputs({...earningsInputs, [booking.id]: Number(e.target.value)})}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {status === 'pending' && (
                        <>
                          <button 
                            type="button"
                            className="text-red-500 font-bold text-sm px-2 py-2 active:opacity-50 transition-opacity"
                            onClick={(e) => { e.stopPropagation(); onReject(booking.id); }}
                          >
                            Reject
                          </button>
                          <button 
                            type="button"
                            className="bg-slate-900 text-white rounded-2xl h-12 px-8 flex items-center justify-center font-bold text-xs shadow-md active:scale-95 transition-transform"
                            onClick={(e) => { e.stopPropagation(); onApprove(booking.id); }}
                          >
                            Approve
                          </button>
                        </>
                      )}
                      {status === 'approved' && (
                        <button 
                          type="button"
                          className="bg-emerald-600 text-white rounded-2xl h-12 px-10 flex items-center justify-center font-bold text-xs shadow-lg shadow-emerald-100 active:scale-95 transition-transform"
                          onClick={(e) => { e.stopPropagation(); onComplete(booking.id, earningsInputs[booking.id]); }}
                        >
                          Finish Session
                        </button>
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
