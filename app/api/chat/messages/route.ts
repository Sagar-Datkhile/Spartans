import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const channelId = searchParams.get('channel_id')

    if (!channelId) {
        return NextResponse.json({ error: 'channel_id is required' }, { status: 400 })
    }

    // Verify the caller is authenticated
    const supabase = await createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Use admin client to bypass RLS for reliable reads
    const { data: messages, error } = await supabaseAdmin
        .from('messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true })
        .limit(50)

    if (error) {
        console.error('Error fetching messages:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!messages || messages.length === 0) {
        return NextResponse.json({ messages: [] })
    }

    // Enrich with sender names
    const senderIds = [...new Set(messages.map((m: any) => m.sender_id))]
    const { data: profiles } = await supabaseAdmin
        .from('users')
        .select('id, name')
        .in('id', senderIds)

    const nameMap = new Map(profiles?.map((p: any) => [p.id, p.name]) ?? [])

    return NextResponse.json({
        messages: messages.map((m: any) => ({
            ...m,
            sender_name: nameMap.get(m.sender_id) ?? 'Unknown',
        }))
    })
}
