'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Message } from '@/lib/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { Send } from 'lucide-react'
import { format, parseISO } from 'date-fns'

interface ChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  isAdmin?: boolean
}

export function ChatDialog({ open, onOpenChange, userId, isAdmin = false }: ChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!open || !userId) return

    const fetchMessages = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      if (!error && data) {
        setMessages(data)
      }
      setLoading(false)
    }

    fetchMessages()

    // Set up realtime subscription
    const channel = supabase
      .channel(`messages:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [open, userId, supabase])

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    const { error } = await supabase.from('messages').insert({
      user_id: userId,
      sender_role: isAdmin ? 'admin' : 'client',
      message: newMessage.trim(),
    })

    if (!error) {
      setNewMessage('')
    }
    setSending(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md h-[600px] flex flex-col p-0">
        <DialogHeader className="p-4 border-b">
          <DialogTitle>
            {isAdmin ? 'Chat with Client' : 'Chat with Therapist'}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea ref={scrollRef} className="flex-1 p-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Spinner />
            </div>
          ) : messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => {
                const isSentByMe = isAdmin
                  ? msg.sender_role === 'admin'
                  : msg.sender_role === 'client'

                return (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex flex-col max-w-[80%]',
                      isSentByMe ? 'ml-auto items-end' : 'items-start'
                    )}
                  >
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-2',
                        isSentByMe
                          ? 'bg-primary text-primary-foreground rounded-br-sm'
                          : 'bg-muted rounded-bl-sm'
                      )}
                    >
                      <p className="text-sm">{msg.message}</p>
                    </div>
                    <span className="text-xs text-muted-foreground mt-1">
                      {format(parseISO(msg.created_at), 'h:mm a')}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </ScrollArea>

        <form onSubmit={handleSend} className="p-4 border-t flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            disabled={sending}
          />
          <Button type="submit" size="icon" disabled={sending || !newMessage.trim()}>
            {sending ? <Spinner className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
