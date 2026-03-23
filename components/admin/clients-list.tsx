'use client'

import { useState } from 'react'
import type { User } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { format, parseISO } from 'date-fns'
import { MessageCircle, Mail, Calendar } from 'lucide-react'
import { ChatDialog } from '@/components/chat/chat-dialog'

interface ClientsListProps {
  users: User[]
}

export function ClientsList({ users }: ClientsListProps) {
  const [chatUserId, setChatUserId] = useState<string | null>(null)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Registered Clients</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {users.map((user) => (
              <div key={user.id} className="flex items-center justify-between py-4 first:pt-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>Joined {format(parseISO(user.created_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setChatUserId(user.id)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Message
                </Button>
              </div>
            ))}
            {users.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No clients registered yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <ChatDialog 
        open={!!chatUserId} 
        onOpenChange={(open) => !open && setChatUserId(null)} 
        userId={chatUserId || ''}
        isAdmin
      />
    </>
  )
}
