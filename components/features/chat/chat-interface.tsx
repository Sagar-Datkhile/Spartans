'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Send } from 'lucide-react'

const mockMessages = [
  {
    id: '1',
    sender: 'John Doe',
    message: 'Hey team, how is the website redesign going?',
    timestamp: '10:30 AM',
    isOwn: false,
  },
  {
    id: '2',
    sender: 'Jane Smith',
    message: 'Hi John! The design is almost done. Should have mockups ready by EOD.',
    timestamp: '10:35 AM',
    isOwn: true,
  },
  {
    id: '3',
    sender: 'Bob Wilson',
    message: 'Great to hear! Let me know if you need any backend support.',
    timestamp: '10:40 AM',
    isOwn: false,
  },
]

export default function ChatInterface() {
  const [message, setMessage] = useState('')

  return (
    <Card className="h-screen md:h-96 flex flex-col">
      <CardHeader>
        <CardTitle>Team Chat</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col h-full space-y-4">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 border rounded-lg p-4 bg-muted/30">
          {mockMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.isOwn ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs rounded-lg px-4 py-2 ${
                  msg.isOwn
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border'
                }`}
              >
                {!msg.isOwn && <p className="text-xs font-semibold mb-1">{msg.sender}</p>}
                <p className="text-sm">{msg.message}</p>
                <p className="text-xs mt-1 opacity-70">{msg.timestamp}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <Button size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
