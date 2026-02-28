'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import ChatInterface from '@/components/features/chat/chat-interface'

export default function ChatPage() {
  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Chat</h1>
        <p className="text-muted-foreground">Real-time communication with your team</p>
      </div>

      <ChatInterface />
    </div>
  )
}
