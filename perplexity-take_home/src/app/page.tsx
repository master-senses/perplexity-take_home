'use client'

import { useState, useMemo } from 'react'
import { ThinkingAnimation } from '../components/thinking-animation'
import { SearchBar } from '../components/search-bar'
import QuestionCard from '@/components/question-card'
import { ResponseCard } from '@/components/response-card'
import { Message}  from '../lib/types'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { createConversation, createMessage, updateConversation, loadMessages } from './services/supabase'
import { useCompletion } from 'ai/react';

import clsx from 'clsx'

export default function SearchEngineInterface() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationId = searchParams.get('conversation')

  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFirstSearch, setIsFirstSearch] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [currentResponseId, setCurrentResponseId] = useState<string>('')

  useEffect(() => {
    if (conversationId) {
      const loadData = async () => {
        const data = await loadMessages(conversationId)
        setMessages(data)
      }
      loadData()
      setIsFirstSearch(false)       // Moves search bar to bottom
    }
  }, [conversationId])  // Runs when conversationId changes

  const { completion, complete } = useCompletion({
    api: '/api/llm',
    onFinish: async (completion: string) => {
      if (!conversationId) return;
      // Update final message in database
      await createMessage(conversationId, completion, 'response', messages.length)
      setIsLoading(false)
      setSearchQuery('')
      setIsFirstSearch(false)
    }
  });

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    let currentConvId = conversationId

    if (!currentConvId) {
      try {
        const conv = await createConversation()
        currentConvId = conv.id
        router.push(`/?conversation=${conv.id}`)
      } catch (error) {
        console.error('Failed to create conversation', error)
      }
    }

    const queryMsg = await createMessage(currentConvId!, searchQuery, 'query', messages.length)
    setMessages(prev => [...prev, queryMsg])
    updateConversation(currentConvId!)

    setIsLoading(true)
    const res = await fetch("/api/semantic_search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: searchQuery}),
    })
    const data = await res.json()
    const context = data.posts.join("\n")
    
    // Create a placeholder for streaming response
    const responseMsg = await createMessage(currentConvId!, '', 'response', messages.length + 1)
    setCurrentResponseId(responseMsg.id)
    setMessages(prev => [...prev, responseMsg])

    // Start streaming completion
    complete(searchQuery, {
      body: { context }
    })
  }

  // Memoize message components
  const MessageList = useMemo(() => 
    messages.map((message) => (
      message.type === 'query' ? (
        <QuestionCard key={message.id} currentQuery={message.content} />
      ) : (
        <ResponseCard 
          key={message.id} 
          content={message.id === currentResponseId ? completion || '' : message.content} 
        />
      )
    )), [messages, completion, currentResponseId]
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4">
      <div className="max-w-3xl mx-auto min-h-screen">
        {/* Messages section */}
        <div className="w-full space-y-6">
          {MessageList}
          
          {isLoading && (
            <div className="mt-20">
              <ThinkingAnimation />
            </div>
          )}

          {/* Spacer div that only appears when we have messages or loading */}
          {(messages.length > 0 || isLoading) && <div className="h-52" />}
        </div>

        {/* Search bar section */}
        <div 
          className={clsx(
            'fixed left-1/2 -translate-x-1/2 w-full max-w-3xl',
            isFirstSearch ? 'top-1/2 -translate-y-1/2' : 'bottom-8'
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

