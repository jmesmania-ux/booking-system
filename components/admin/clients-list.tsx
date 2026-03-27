'use client'

import React, { useState } from 'react';
import type { User, Booking } from '@/lib/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Mail, Calendar, ChevronDown, ChevronUp, 
  UserCircle, MessageSquare, Phone, History 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';

interface ClientsListProps {
  users: User[];
  // Assuming 'mobile' is now part of the Booking type from your updated store/DB
  bookings: (Booking & { users: { email: string }, mobile?: string })[];
}

export function ClientsList({ users, bookings }: ClientsListProps) {
  const [expandedClientId, setExpandedClientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const getClientStats = (clientId: string) => {
    const clientBookings = bookings.filter(b => b.user_id === clientId);
    const sorted = [...clientBookings].sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    
    return {
      total: clientBookings.length,
      approved: clientBookings.filter(b => b.status === 'approved').length,
      pending: clientBookings.filter(b => b.status === 'pending').length,
      latest: sorted[0] || null
    };
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-24">
      {/* Search Header */}
      <div className="px-1 space-y-4">
        <Input 
          placeholder="Search bookings or clients..." 
          className="bg-white border-slate-200 rounded-xl h-12 shadow-sm focus-visible:ring-emerald-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <h2 className="text-lg font-bold text-slate-800">
          Registered Clients <span className="text-slate-400 font-normal">({users.length})</span>
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filteredUsers.length === 0 ? (
          <p className="text-center py-8 text-slate-400">No clients found</p>
        ) : (
          filteredUsers.map((user) => {
            const stats = getClientStats(user.id);
            const isExpanded = expandedClientId === user.id;
            const joinDate = user.created_at 
              ? new Date(user.created_at).toLocaleDateString() 
              : 'N/A';
            
            // Get the mobile number from the latest booking
            const clientMobile = stats.latest?.mobile || '';

            return (
              <Card key={user.id} className="overflow-hidden border-none shadow-sm ring-1 ring-slate-200">
                <CardContent className="p-0">
                  {/* Main Row */}
                  <div 
                    className="p-4 flex items-center gap-4 bg-slate-50/50 cursor-pointer"
                    onClick={() => setExpandedClientId(isExpanded ? null : user.id)}
                  >
                    <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <UserCircle className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-900 truncate text-sm">{user.email}</h3>
                      <p className="text-[10px] text-slate-500">Joined {joinDate}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[10px]">
                        {stats.total} {stats.total === 1 ? 'Booking' : 'Bookings'}
                      </Badge>
                      {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t bg-white">
                      <div className="p-4 space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase font-bold text-slate-400">Contact Info</p>
                            <p className="text-xs text-slate-600">User ID: {user.id.slice(0, 8)}...</p>
                            <p className="text-xs text-slate-600">Email: {user.email}</p>
                            <p className="text-xs text-slate-600 font-medium">Mobile: {clientMobile || 'Not provided'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-[10px] uppercase font-bold text-slate-400">Booking Stats</p>
                            <p className="text-xs text-slate-600">
                              {stats.approved} Approved • {stats.pending} Pending
                            </p>
                            {stats.latest && (
                              <div className="mt-2 flex items-center gap-2 text-xs font-medium text-slate-700">
                                <History size={14} className="text-slate-400" />
                                Latest: {stats.latest.service} ({stats.latest.status})
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Mobile Actions - Now Functional */}
                        <div className="flex gap-2 pt-2">
                          <Button 
                            variant="outline" 
                            className="flex-1 h-9 text-xs border-slate-200 gap-2"
                            disabled={!clientMobile}
                            asChild
                          >
                            <a href={`sms:${clientMobile}`}>
                              <MessageSquare size={14} /> SMS
                            </a>
                          </Button>
                          <Button 
                            className="flex-1 h-9 text-xs bg-slate-900 text-white gap-2"
                            disabled={!clientMobile}
                            asChild
                          >
                            <a href={`tel:${clientMobile}`}>
                              <Phone size={14} /> Call
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
