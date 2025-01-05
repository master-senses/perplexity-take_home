import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@supabase/supabase-js'
import { Conversation, Message } from '../../lib/types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY
const supabase = createClient(supabaseUrl!, supabaseKey!)

export async function updateConversation(convId: string) {
    try {
        const { data: conv, error } = await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', convId)
            .select()
            .single()

    } catch (error) {
        console.error('Failed to update conversation', error)
        throw new Error('Failed to update conversation')
    }
}

export async function loadMessages(convId: string) {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', convId)
            .order('order_index', { ascending: true })
        if (data && !error) {
            return data
        }
        return []
    } catch (error) {
        console.error('Failed to load messages', error)
        throw new Error('Failed to load messages')
    }
}

export async function createConversation() : Promise<Conversation> {
    const { data: conv, error } = await supabase
        .from('conversations')
        .insert({ id: uuidv4(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .select()
        .single()

    if (conv && !error) {
        return conv
    } else {
        throw new Error('Failed to create conversation')
    }
}

export async function createMessage(convId: string, message: string, type: 'query' | 'response', message_length: number) {
    try {
        const { data: queryMsg, error } = await supabase
            .from('messages')
            .insert({
        conversation_id: convId,
        type: type,
        content: message,
        order_index: message_length
      })
      .select()
      .single()

    if (queryMsg && !error) {
        return queryMsg
    }
    } catch (error) {   
        console.error('Failed to create message', error)
        throw new Error('Failed to create message')
    }
}

export async function updateMessage(msgId: string, content: string) {
    const { data: msg, error } = await supabase
        .from('messages')
        .update({ content })
        .eq('id', msgId)
        .select()
        .single()

    if (msg && !error) {
        return msg
    } else {
        throw new Error('Failed to update message')
    }
}

