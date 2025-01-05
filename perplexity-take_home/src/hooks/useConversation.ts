'use client'

import { useState, useRef } from 'react'
import { useCompletion } from 'ai/react'
import { Message } from '@/types/chat'
import { updateMessage } from '@/app/services/supabase'

interface UseConversationProps {
  initialMessages: Message[]
}

export function useConversation({ initialMessages }: UseConversationProps) {
  const responseIdRef = useRef<string>('')
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  
  const { complete } = useCompletion({
    api: '/api/llm',
    onResponse: async (response) => {
      const reader = response.body?.getReader()
      if (!reader) return
      let chunk = await reader.read()
      let combinedText = ''
      while (!chunk.done) {
        combinedText += new TextDecoder().decode(chunk.value)
        setMessages(prev => prev.map(msg =>
          msg.id === responseIdRef.current
            ? { ...msg, content: combinedText }
            : msg
        ))
        chunk = await reader.read()
      }
      await updateMessage(responseIdRef.current, combinedText)
    }
  });

  const addMessage = (message: Message) => {
    setMessages(prev => [...prev, message])
  }

  return {
    messages,
    addMessage,
    complete,
    responseIdRef
  }
} 