'use client'

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Scroll, Send, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'

interface ChatDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
}

interface Message {
  id: string
  user_id: string
  message: string
  created_at: string
  is_admin: boolean
}

export function ChatDialog({ open, onOpenChange, userId }: ChatDialogProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const supabase = createClient()

  // Auto-scroll to bottom whenever messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (!open || !userId) return

    // 1. Fetch initial history
    const fetchMessages = async () => {
      const { data } = await supabase
        .from('messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })

      setMessages(data || [])
    }

    fetchMessages()

    // 2. REAL-TIME SUBSCRIPTION
    // This listens for ANY new insert in the 'messages' table for this user
    const channel = supabase
      .channel(`chat:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          // Check if message is already in state to prevent duplicates
          setMessages((prev) => {
            if (prev.find((m) => m.id === newMsg.id)) return prev
            return [...prev, newMsg]
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [open, userId, supabase])

  const handleSendMessage = async () => {
    if (!newMessage.trim() || loading) return

    setLoading(true)
    try {
      const { error } = await supabase.from('messages').insert({
        user_id: userId,
        message: newMessage.trim(),
        is_admin: false,
      })

      if (error) throw error
      setNewMessage('')
      // Note: We don't need to manually fetch anymore! 
      // The Real-time listener above will catch our own insert.
    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[2rem]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Chat with King's Massage
          </DialogTitle>
          <DialogDescription>Typically replies in a few minutes</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col h-[450px] space-y-4">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground opacity-50">
                <div className="text-center">
                  <Scroll className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm italic">No messages yet...</p>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.is_admin ? 'justify-start' : 'justify-end'}`}
                >
                  <div
                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm shadow-sm ${
                      msg.is_admin
                        ? 'bg-white border text-gray-800 rounded-tl-none'
                        : 'bg-green-600 text-white rounded-tr-none'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.message}</p>
                    <p className={`text-[10px] mt-1 text-right opacity-70`}>
                      {format(new Date(msg.created_at), 'p')}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="flex gap-2 p-1 border-t pt-4">
            <Input
              placeholder="Message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              disabled={loading}
              className="rounded-xl border-gray-200 focus:ring-green-500"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || loading}
              className="rounded-xl bg-green-600 hover:bg-green-700 w-12"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
