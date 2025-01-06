'use client'

import { useState, useMemo, useRef, Suspense } from 'react'
import { ThinkingAnimation } from '../components/thinking-animation'
import { SearchBar } from '../components/search-bar'
import QuestionCard from '@/components/question-card'
import { ResponseCard } from '@/components/response-card'
import { Message}  from '../types/chat'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { createConversation, createMessage, updateConversation, loadMessages, updateMessage } from './services/supabase'
import { useCompletion } from 'ai/react'
import { BookmarkIcon } from '@/components/bookmark-icon'
import clsx from 'clsx'

function SearchEngineContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationId = searchParams.get('conversation')
  const isFirstSearch = !searchParams.has('conversation')

  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const responseIdRef = useRef<string>('')

  useEffect(() => {
    if (conversationId) {
      const loadData = async () => {
        const data = await loadMessages(conversationId)
        setMessages(data)
      }
      loadData()
    }
  }, [conversationId])

  const { complete } = useCompletion({
    api: '/api/llm',
    onResponse: async (response) => {
      const reader = response.body?.getReader()
      if (!reader) return
      let chunk = await reader.read()
      let combinedText = ''
      while (!chunk.done) {
        combinedText += new TextDecoder().decode(chunk.value)
        setMessages(prev =>
          !responseIdRef.current
            ? prev
            : prev.map(msg =>
                msg.id === responseIdRef.current
                  ? { ...msg, content: combinedText }
                  : msg
              )
        )
        chunk = await reader.read()
      }
      await updateMessage(responseIdRef.current, combinedText)
    }
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    let currentConvId = conversationId

    if (!currentConvId) {
      try {
        const conv = await createConversation()
        currentConvId = conv.id
        await router.push(`/?conversation=${conv.id}`)
      } catch (error) {
        console.error('Failed to create conversation', error)
        return
      }
    }

    // Create and save query message
    const queryMsg = await createMessage(currentConvId!, searchQuery, 'query', messages.length, null)
    setMessages(prev => [...prev, queryMsg])
    await updateConversation(currentConvId!)

    setIsLoading(true)

    const res = await fetch("/api/semantic_search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: searchQuery}),
    })
    const data = await res.json()
    const matches = data.context
    const responseMsg = await createMessage(currentConvId!, '', 'response', messages.length + 1, matches)
    responseIdRef.current = responseMsg.id
    setMessages(prev => [...prev, responseMsg])
    await complete(searchQuery, { body: { prompt: searchQuery, context: matches } })

    setIsLoading(false)
    setSearchQuery('')
  }

  // Memoize message components
  const MessageList = useMemo(() => 
    messages.map((message) => (
      message.type === 'query' ? (
        <QuestionCard key={message.id} currentQuery={message.content} />
      ) : (
        <ResponseCard 
          key={message.id} 
          content={message.content} 
          sources={message.sources}
        />
      )
    )), [messages]
  )

  return (
    <div className="min-h-screen text-white p-4">
      <div className="max-w-3xl mx-auto min-h-screen">
        <div className="w-full space-y-6">
          {MessageList}
          
          {isLoading && (
            <div className="mt-20">
              <ThinkingAnimation />
            </div>
          )}

          {(messages.length > 0 || isLoading) && <div className="h-52" />}
        </div>

        {isFirstSearch && (
          <div className="fixed top-1/4 left-1/2 -translate-x-[100%]">
            <BookmarkIcon />
          </div>
        )}

        <div 
          className={clsx(
            'fixed left-1/2 -translate-x-1/2 w-full max-w-3xl -translate-x-[%]' ,
            isFirstSearch ? 'bottom-1/3 -translate-y-1/2 ' : 'bottom-8'
          )}
        >
          <SearchBar 
            searchQuery={searchQuery}
            isFirstSearch={isFirstSearch}
            onSearch={handleSearch}
            onChange={setSearchQuery}
          />
        </div>
      </div>
    </div>
  )
}

export default function SearchEngineInterface() {
  return (
    <Suspense fallback={<ThinkingAnimation />}>
      <SearchEngineContent />
    </Suspense>
  )
}