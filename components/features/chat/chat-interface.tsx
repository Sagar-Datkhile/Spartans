'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import {
  Bold, Italic, Strikethrough, Link as LinkIcon, List, ListOrdered, Code, Quote,
  Plus, Smile, AtSign, Video, Mic, Send, Hash, Users, Headphones, Search,
  MessageSquare, ClipboardList, ChevronDown, Loader2
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAppStore } from '@/lib/store'
import { createClient } from '@/lib/supabase/client'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Project { id: string; name: string }
interface ChatUser { id: string; name: string; role: string }
interface Message {
  id: string
  channel_id: string
  sender_id: string
  content: string
  created_at: string
  sender_name?: string
}
interface ActiveChat { type: 'channel' | 'dm'; id: string; name: string }

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Stable DM channel ID regardless of who initiated */
function dmChannelId(uid1: string, uid2: string) {
  return `dm:${[uid1, uid2].sort().join('_')}`
}

function projectChannelId(projectId: string) {
  return `project:${projectId}`
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatInterface() {
  const { currentUser } = useAppStore()
  const supabase = createClient()

  // Sidebar data
  const [projects, setProjects] = useState<Project[]>([])
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([])

  // Chat state
  const [activeChat, setActiveChat] = useState<ActiveChat>({ type: 'channel', id: 'all', name: 'all-spartans' })
  const [messages, setMessages] = useState<Message[]>([])
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  const bottomRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<any>(null)    // holds the active Realtime subscription

  // ── 1. Fetch sidebar data when user is ready ────────────────────────────────
  useEffect(() => {
    if (!currentUser?.id) return

    async function loadSidebar() {
      // Load all projects (no company filter — all users are separate companies currently)
      const { data: projs } = await supabase
        .from('projects')
        .select('id, name')
        .order('name')

      // Load all users except self
      const { data: users } = await supabase
        .from('users')
        .select('id, name, role')
        .neq('id', currentUser!.id)

      if (projs) setProjects(projs)
      if (users) setChatUsers(users)
    }

    loadSidebar()
  }, [currentUser?.id])

  // ── 2. Load message history + subscribe to Realtime on channel switch ────────
  const switchChannel = useCallback(async (chat: ActiveChat) => {
    setActiveChat(chat)
    setMessages([])
    setLoading(true)

    // Unsubscribe from previous channel
    if (channelRef.current) {
      await supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }

    const channelId =
      chat.type === 'channel'
        ? (chat.id === 'all' ? 'channel:all' : projectChannelId(chat.id))
        : dmChannelId(currentUser!.id, chat.id)

    // Load history via server API (bypasses RLS auth timing issues)
    const res = await fetch(`/api/chat/messages?channel_id=${encodeURIComponent(channelId)}`)
    if (res.ok) {
      const data = await res.json()
      setMessages(data.messages ?? [])
    } else {
      console.error('Failed to load messages:', await res.text())
    }

    setLoading(false)

    // Subscribe to new messages on this channel
    const realtimeChannel = supabase
      .channel(`realtime:${channelId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        async (payload) => {
          const newMsg = payload.new as Message

          // Fetch sender name (not included in Realtime payload)
          const { data: senderData } = await supabase
            .from('users')
            .select('name')
            .eq('id', newMsg.sender_id)
            .single()

          setMessages(prev => [
            ...prev,
            { ...newMsg, sender_name: senderData?.name ?? 'Unknown' },
          ])
        }
      )
      .subscribe()

    channelRef.current = realtimeChannel
  }, [currentUser?.id, supabase])

  // Load the default "all-spartans" channel on first mount
  useEffect(() => {
    if (currentUser?.id) {
      switchChannel({ type: 'channel', id: 'all', name: 'all-spartans' })
    }
    return () => {
      if (channelRef.current) supabase.removeChannel(channelRef.current)
    }
  }, [currentUser?.id])

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── 3. Send a message ───────────────────────────────────────────────────────
  const handleSend = async () => {
    const text = message.trim()
    if (!text || !currentUser?.id) return

    const channelId =
      activeChat.type === 'channel'
        ? (activeChat.id === 'all' ? 'channel:all' : projectChannelId(activeChat.id))
        : dmChannelId(currentUser.id, activeChat.id)

    // Optimistically add to UI immediately so sender sees it right away
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      channel_id: channelId,
      sender_id: currentUser.id,
      content: text,
      created_at: new Date().toISOString(),
      sender_name: currentUser.name,
    }
    setMessages(prev => [...prev, optimisticMsg])
    setMessage('')

    setSending(true)
    const { error } = await supabase.from('messages').insert({
      channel_id: channelId,
      sender_id: currentUser.id,
      content: text,
    })
    setSending(false)

    if (error) {
      console.error('Failed to send message:', error)
      // Remove the optimistic message on failure
      setMessages(prev => prev.filter(m => m.id !== optimisticMsg.id))
      setMessage(text) // restore text
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-full w-full bg-white text-gray-700 font-sans overflow-hidden border rounded-xl shadow-sm">

      {/* ── Sidebar ── */}
      <div className="w-64 flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col">
        <div className="h-[60px] flex items-center px-4 border-b border-gray-200">
          <h2 className="font-bold text-gray-900 text-lg">Spartans HQ</h2>
          <ChevronDown className="w-4 h-4 ml-auto text-gray-500" />
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto py-3 space-y-6">

          {/* General Channel */}
          <div>
            <div className="flex items-center px-4 mb-1">
              <ChevronDown className="w-3 h-3 mr-1 text-gray-500" />
              <span className="text-sm font-semibold text-gray-500">General</span>
            </div>
            <div
              onClick={() => switchChannel({ type: 'channel', id: 'all', name: 'all-spartans' })}
              className={`flex items-center px-8 py-1.5 text-[15px] cursor-pointer ${activeChat.id === 'all' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Hash className="w-4 h-4 mr-2 opacity-70" />
              <span>all-spartans</span>
            </div>
          </div>

          {/* Project Channels */}
          <div>
            <div className="flex items-center px-4 mb-1">
              <ChevronDown className="w-3 h-3 mr-1 text-gray-500" />
              <span className="text-sm font-semibold text-gray-500">Projects ({projects.length})</span>
            </div>
            <div className="space-y-[1px]">
              {projects.length === 0 && (
                <p className="px-8 py-2 text-xs text-gray-400">No projects yet</p>
              )}
              {projects.map(proj => (
                <div
                  key={proj.id}
                  onClick={() => switchChannel({ type: 'channel', id: proj.id, name: proj.name })}
                  className={`flex items-center px-8 py-1.5 text-[15px] cursor-pointer ${activeChat.id === proj.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Hash className="w-4 h-4 mr-2 opacity-70" />
                  <span className="truncate">{proj.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Messages */}
          <div>
            <div className="flex items-center px-4 mb-1">
              <ChevronDown className="w-3 h-3 mr-1 text-gray-500" />
              <span className="text-sm font-semibold text-gray-500">Direct Messages</span>
            </div>
            <div className="space-y-[1px]">
              {chatUsers.length === 0 && (
                <p className="px-8 py-2 text-xs text-gray-400">No teammates found</p>
              )}
              {chatUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => switchChannel({ type: 'dm', id: user.id, name: user.name })}
                  className={`flex items-center px-8 py-1.5 text-[15px] cursor-pointer ${activeChat.id === user.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <Avatar className="w-5 h-5 rounded mr-2">
                    <AvatarFallback className="bg-gray-200 text-[10px] text-gray-700 font-medium rounded">
                      {user.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate">{user.name}</span>
                  <span className="ml-auto text-[10px] font-medium text-gray-400 px-1 border border-gray-200 rounded">
                    {user.role === 'SUPERADMIN' ? 'SA' : user.role === 'MANAGER' ? 'MGR' : 'EMP'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col min-w-0 bg-white">

        {/* Header */}
        <div className="h-[60px] flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            {activeChat.type === 'channel'
              ? <Hash className="w-5 h-5 text-gray-500" />
              : <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-[10px] text-gray-700 font-bold border border-gray-200">
                {activeChat.name.substring(0, 2).toUpperCase()}
              </div>
            }
            <h1 className="text-lg font-bold text-gray-900">{activeChat.name}</h1>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {activeChat.type === 'channel' && (
              <div className="flex items-center gap-1.5 hover:bg-gray-100 p-1.5 rounded cursor-pointer">
                <Headphones className="w-4 h-4" />
                <span>Huddle</span>
              </div>
            )}
            <div className="hover:bg-gray-100 p-1.5 rounded cursor-pointer">
              <Search className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Tabs (channels only) */}
        {activeChat.type === 'channel' && (
          <div className="flex items-center gap-6 px-4 py-2 border-b border-gray-200 text-sm font-medium bg-gray-50/50 shrink-0">
            <div className="flex items-center gap-2 text-gray-900 border-b-2 border-blue-600 pb-2 -mb-2 cursor-pointer">
              <MessageSquare className="w-4 h-4" />
              <span>Messages</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 hover:text-gray-900 cursor-pointer">
              <ClipboardList className="w-4 h-4" />
              <span>Canvas</span>
            </div>
          </div>
        )}

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">

          {/* Welcome block */}
          {!loading && messages.length === 0 && (
            <div className="pt-20 pb-4">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-4">
                {activeChat.type === 'channel' ? <Hash className="w-8 h-8 text-gray-500" /> : <Users className="w-8 h-8 text-gray-500" />}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {activeChat.type === 'channel' ? `Welcome to #${activeChat.name}!` : `Conversation with ${activeChat.name}`}
              </h2>
              <p className="text-gray-500">
                {activeChat.type === 'channel'
                  ? 'This is the start of the channel. Send a message to get the conversation going.'
                  : 'Send a message to start a direct conversation.'}
              </p>
            </div>
          )}

          {/* Loading spinner */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          )}

          {/* Message list */}
          {messages.map((msg, i) => {
            const isMe = msg.sender_id === currentUser?.id
            const showAvatar = i === 0 || messages[i - 1].sender_id !== msg.sender_id
            return (
              <div key={msg.id} className="flex gap-3 group">
                {showAvatar ? (
                  <Avatar className="w-10 h-10 rounded shadow-sm border border-gray-200 shrink-0">
                    <AvatarFallback className={`rounded text-white font-bold text-sm ${isMe ? 'bg-blue-600' : 'bg-gray-500'}`}>
                      {(msg.sender_name ?? '?')[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-10 h-10 shrink-0" />
                )}
                <div className="flex-1">
                  {showAvatar && (
                    <div className="flex items-baseline gap-2">
                      <span className={`font-bold ${isMe ? 'text-blue-700' : 'text-gray-900'}`}>
                        {isMe ? 'You' : msg.sender_name}
                      </span>
                      <span className="text-xs text-gray-400">{formatTime(msg.created_at)}</span>
                    </div>
                  )}
                  <p className="text-gray-700 text-[15px] mt-0.5 leading-relaxed">{msg.content}</p>
                </div>
              </div>
            )
          })}

          <div ref={bottomRef} />
        </div>

        {/* ── Message Input ── */}
        <div className="p-4 pt-2 shrink-0">
          <div className="border border-gray-300 rounded-xl bg-white focus-within:border-gray-400 focus-within:shadow-[0_0_0_1px_rgba(156,163,175,1)] transition-all flex flex-col shadow-sm">

            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 bg-gray-50 rounded-t-xl border-b border-gray-200">
              <ToolbarBtn icon={<Bold className="w-4 h-4" />} />
              <ToolbarBtn icon={<Italic className="w-4 h-4" />} />
              <ToolbarBtn icon={<Strikethrough className="w-4 h-4" />} />
              <div className="w-[1px] h-4 bg-gray-300 mx-1" />
              <ToolbarBtn icon={<LinkIcon className="w-4 h-4" />} />
              <div className="w-[1px] h-4 bg-gray-300 mx-1" />
              <ToolbarBtn icon={<List className="w-4 h-4" />} />
              <ToolbarBtn icon={<ListOrdered className="w-4 h-4" />} />
              <div className="w-[1px] h-4 bg-gray-300 mx-1" />
              <ToolbarBtn icon={<Code className="w-4 h-4" />} />
              <ToolbarBtn icon={<Quote className="w-4 h-4" />} />
            </div>

            {/* Textarea */}
            <textarea
              className="w-full bg-transparent text-gray-900 p-3 outline-none resize-none min-h-[60px] text-[15px] placeholder-gray-400"
              placeholder={`Message ${activeChat.type === 'channel' ? '#' : ''}${activeChat.name} · Enter to send`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={sending}
            />

            {/* Bottom toolbar */}
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-b-xl border-t border-transparent">
              <div className="flex items-center gap-1">
                <ToolbarBtn icon={<Plus className="w-4 h-4" />} />
                <ToolbarBtn icon={<Smile className="w-4 h-4" />} />
                <ToolbarBtn icon={<AtSign className="w-4 h-4" />} />
                <div className="w-[1px] h-4 bg-gray-300 mx-1" />
                <ToolbarBtn icon={<Video className="w-4 h-4" />} />
                <ToolbarBtn icon={<Mic className="w-4 h-4" />} />
              </div>

              <button
                onClick={handleSend}
                disabled={!message.trim() || sending}
                className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${message.trim() && !sending
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-transparent text-gray-400 cursor-not-allowed'
                  }`}
              >
                {sending
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <Send className="w-4 h-4 ml-0.5" />
                }
              </button>
            </div>
          </div>

          <p className="text-[11px] text-gray-400 mt-1.5 px-1">
            <kbd className="bg-gray-100 border border-gray-200 px-1 rounded text-[10px]">Enter</kbd> to send · <kbd className="bg-gray-100 border border-gray-200 px-1 rounded text-[10px]">Shift+Enter</kbd> for new line
          </p>
        </div>
      </div>
    </div>
  )
}

function ToolbarBtn({ icon }: { icon: React.ReactNode }) {
  return (
    <button className="w-7 h-7 flex items-center justify-center rounded text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition">
      {icon}
    </button>
  )
}
