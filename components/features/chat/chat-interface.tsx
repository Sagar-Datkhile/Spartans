'use client'

import { useState } from 'react'
import {
  Bold, Italic, Underline, Strikethrough, Link as LinkIcon, List, ListOrdered, Code, Quote,
  Plus, Smile, AtSign, Video, Mic, Send, Hash, Users, Headphones, Search, MessageSquare, ClipboardList, ChevronDown
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAppStore } from '@/lib/store'

// Mock Data for the sidebar
const MOCK_PROJECTS = [
  { id: 'all', name: 'all-spartans', allowedRoles: ['SUPERADMIN', 'MANAGER', 'EMPLOYEE'] },
  { id: 'p1', name: 'website-redesign', allowedRoles: ['SUPERADMIN', 'MANAGER', 'EMPLOYEE'] },
  { id: 'p2', name: 'mobile-app-v2', allowedRoles: ['SUPERADMIN', 'MANAGER'] },
  { id: 'p3', name: 'executive-planning', allowedRoles: ['SUPERADMIN'] },
]

const MOCK_USERS = [
  { id: 'u1', name: 'System Admin (DA)', role: 'SUPERADMIN', isOnline: true },
  { id: 'u2', name: 'Lokesh Khairnar', role: 'MANAGER', isOnline: true },
  { id: 'u3', name: 'Jane Smith', role: 'MANAGER', isOnline: false },
  { id: 'u4', name: 'John Doe', role: 'EMPLOYEE', isOnline: true },
  { id: 'u5', name: 'Alice Johnson', role: 'EMPLOYEE', isOnline: false },
]

export default function ChatInterface() {
  const { currentUser } = useAppStore()
  const [message, setMessage] = useState('')
  const [activeChat, setActiveChat] = useState<{ type: 'channel' | 'dm', id: string, name: string }>({ type: 'channel', id: 'all', name: 'all-spartans' })

  // Filter projects based on user role
  const visibleProjects = MOCK_PROJECTS.filter(p => p.allowedRoles.includes(currentUser?.role || 'EMPLOYEE'))

  // Filter users based on user role rules
  const visibleUsers = MOCK_USERS.filter(u => {
    if (u.id === currentUser?.id) return false // Hide self
    if (currentUser?.role === 'SUPERADMIN') return true
    if (currentUser?.role === 'MANAGER') return true
    if (currentUser?.role === 'EMPLOYEE') return u.role !== 'SUPERADMIN'
    return false
  })

  return (
    <div className="flex h-full w-full bg-white text-gray-700 font-sans overflow-hidden border rounded-xl shadow-sm">

      {/* ── Outer Sidebar (Channels & DMs) ── */}
      <div className="w-64 flex-shrink-0 bg-gray-50 border-r border-gray-200 flex flex-col">
        {/* Workspace Header */}
        <div className="h-[60px] flex items-center px-4 border-b border-gray-200 hover:bg-gray-100 cursor-pointer transition">
          <h2 className="font-bold text-gray-900 text-lg">Spartans HQ</h2>
          <ChevronDown className="w-4 h-4 ml-auto text-gray-500" />
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto py-3 space-y-6">

          {/* Projects / Channels */}
          <div>
            <div className="flex items-center px-4 mb-1 group cursor-pointer">
              <ChevronDown className="w-3 h-3 mr-1 text-gray-500" />
              <span className="text-sm font-semibold text-gray-500 group-hover:text-gray-700">Projects (Channels)</span>
            </div>
            <div className="space-y-[1px]">
              {visibleProjects.map(proj => (
                <div
                  key={proj.id}
                  onClick={() => setActiveChat({ type: 'channel', id: proj.id, name: proj.name })}
                  className={`flex items-center px-8 py-1.5 text-[15px] cursor-pointer ${activeChat.id === proj.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <Hash className="w-4 h-4 mr-2 opacity-70" />
                  <span>{proj.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Messages */}
          <div>
            <div className="flex items-center px-4 mb-1 group cursor-pointer">
              <ChevronDown className="w-3 h-3 mr-1 text-gray-500" />
              <span className="text-sm font-semibold text-gray-500 group-hover:text-gray-700">Direct Messages</span>
            </div>
            <div className="space-y-[1px]">
              {visibleUsers.map(user => (
                <div
                  key={user.id}
                  onClick={() => setActiveChat({ type: 'dm', id: user.id, name: user.name })}
                  className={`flex items-center px-8 py-1.5 text-[15px] cursor-pointer ${activeChat.id === user.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  <div className="relative mr-2">
                    <Avatar className="w-5 h-5 rounded">
                      <AvatarFallback className="bg-gray-200 text-[10px] text-gray-700 font-medium rounded">
                        {user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    {user.isOnline && (
                      <div className="absolute -bottom-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                    )}
                  </div>
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

        {/* Top Header */}
        <div className="h-[60px] flex items-center justify-between px-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-2">
            {activeChat.type === 'channel' ? (
              <Hash className="w-5 h-5 text-gray-500" />
            ) : (
              <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center text-[10px] text-gray-700 font-bold border border-gray-200">
                {activeChat.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            <h1 className="text-lg font-bold text-gray-900">{activeChat.name}</h1>
          </div>
          <div className="flex items-center gap-4 text-sm font-medium text-gray-500">
            {activeChat.type === 'channel' && (
              <>
                <div className="flex items-center gap-1.5 hover:bg-gray-100 p-1.5 rounded cursor-pointer transition">
                  <Users className="w-4 h-4" />
                  <span>3</span>
                </div>
                <div className="flex items-center gap-1.5 hover:bg-gray-100 p-1.5 rounded cursor-pointer transition">
                  <Headphones className="w-4 h-4" />
                  <span>Huddle</span>
                </div>
              </>
            )}
            <div className="hover:bg-gray-100 p-1.5 rounded cursor-pointer transition text-gray-500">
              <Search className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Tabs / Sub-header (Only for channels) */}
        {activeChat.type === 'channel' && (
          <div className="flex items-center gap-6 px-4 py-2 border-b border-gray-200 text-sm font-medium shrink-0 bg-gray-50/50">
            <div className="flex items-center gap-2 text-gray-900 border-b-2 border-blue-600 pb-2 -mb-2 cursor-pointer">
              <MessageSquare className="w-4 h-4" />
              <span>Messages</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 hover:text-gray-900 cursor-pointer">
              <ClipboardList className="w-4 h-4" />
              <span>Add canvas</span>
            </div>
            <div className="text-gray-500 hover:text-gray-900 cursor-pointer">
              <Plus className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Chat Content Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">

          {/* Welcome Message */}
          <div className="pt-20 pb-4">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center mb-4">
              {activeChat.type === 'channel' ? <Hash className="w-8 h-8 text-gray-500" /> : <Users className="w-8 h-8 text-gray-500" />}
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {activeChat.type === 'channel' ? `Welcome to #${activeChat.name}!` : `This is your conversation with ${activeChat.name}`}
            </h2>
            <p className="text-gray-500">
              {activeChat.type === 'channel'
                ? "This is the start of the channel. You can send messages, share files, and collaborate."
                : "You can send direct messages here securely."}
            </p>
          </div>

          {/* Date Separator */}
          <div className="relative flex items-center py-4">
            <div className="flex-grow border-t border-gray-200"></div>
            <span className="flex-shrink-0 mx-4 text-xs font-medium text-gray-500 border border-gray-200 rounded-full px-3 py-1 bg-white">
              Today <span className="ml-1">▼</span>
            </span>
            <div className="flex-grow border-t border-gray-200"></div>
          </div>

          {/* Dynamic Message */}
          <div className="flex gap-3 group">
            <Avatar className="w-10 h-10 rounded shadow-sm border border-gray-200">
              <AvatarImage src="" />
              <AvatarFallback className="bg-blue-600 rounded text-white font-bold">
                {currentUser?.name?.[0] || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-baseline gap-2">
                <span className="font-bold text-gray-900">{currentUser?.name || 'User'}</span>
                <span className="text-xs text-gray-500">Just now</span>
              </div>
              <p className="text-gray-700 text-[15px] mt-0.5 leading-relaxed">
                I am currently viewing the {activeChat.type === 'channel' ? 'project channel' : 'direct message'} for <span className="font-semibold text-gray-900">{activeChat.name}</span>!
              </p>
            </div>
          </div>

        </div>

        {/* ── Message Input Box ── */}
        <div className="p-4 pt-2 shrink-0">
          <div className="border border-gray-300 rounded-xl bg-white focus-within:border-gray-400 focus-within:shadow-[0_0_0_1px_rgba(156,163,175,1)] transition-all flex flex-col shadow-sm">

            {/* Toolbar Top */}
            <div className="flex items-center gap-1 p-2 bg-gray-50 rounded-t-xl border-b border-gray-200">
              <ToolbarBtn icon={<Bold className="w-4 h-4" />} />
              <ToolbarBtn icon={<Italic className="w-4 h-4" />} />
              <ToolbarBtn icon={<Strikethrough className="w-4 h-4" />} />
              <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
              <ToolbarBtn icon={<LinkIcon className="w-4 h-4" />} />
              <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
              <ToolbarBtn icon={<List className="w-4 h-4" />} />
              <ToolbarBtn icon={<ListOrdered className="w-4 h-4" />} />
              <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
              <ToolbarBtn icon={<Code className="w-4 h-4" />} />
              <ToolbarBtn icon={<Quote className="w-4 h-4" />} />
            </div>

            {/* Text Area */}
            <textarea
              className="w-full bg-transparent text-gray-900 p-3 outline-none resize-none min-h-[60px] text-[15px] placeholder-gray-400"
              placeholder={`Message ${activeChat.type === 'channel' ? '#' : ''}${activeChat.name}`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />

            {/* Toolbar Bottom */}
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded-b-xl border-t border-transparent">
              <div className="flex items-center gap-1">
                <ToolbarBtn icon={<Plus className="w-4 h-4" />} />
                <ToolbarBtn icon={<span className="font-bold font-serif">Aa</span>} />
                <ToolbarBtn icon={<Smile className="w-4 h-4" />} />
                <ToolbarBtn icon={<AtSign className="w-4 h-4" />} />
                <div className="w-[1px] h-4 bg-gray-300 mx-1"></div>
                <ToolbarBtn icon={<Video className="w-4 h-4" />} />
                <ToolbarBtn icon={<Mic className="w-4 h-4" />} />
              </div>

              <div className="flex items-center gap-1">
                <button
                  className={`w-8 h-8 flex items-center justify-center rounded transition-colors ${message.trim() ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-transparent text-gray-400 hover:bg-gray-200'}`}
                >
                  <Send className="w-4 h-4 ml-0.5" />
                </button>
                <div className="w-[1px] h-4 bg-gray-300 mx-1 text-xs"></div>
                <button className="w-6 h-8 flex items-center justify-center rounded text-gray-400 hover:bg-gray-200 transition">
                  ▼
                </button>
              </div>
            </div>
          </div>
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
