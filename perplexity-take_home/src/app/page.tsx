'use client'

import { useState, useMemo } from 'react'
import { ThinkingAnimation } from '../components/thinking-animation'
import { SearchBar } from '../components/search-bar'
import QuestionCard from '@/components/question-card'
import { ResponseCard } from '@/components/response-card'
import { createClient } from '@supabase/supabase-js'
import { Message}  from './types'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { createConversation, createMessage, updateConversation, loadMessages } from './services/supabase'

export default function SearchEngineInterface() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationId = searchParams.get('conversation')

  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFirstSearch, setIsFirstSearch] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])

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
    const response = `This is a sample response for "${searchQuery}". In a real application, this would be replaced with actual API response data.`

    // Save response
    const responseMsg = await createMessage(currentConvId!, response, 'response', messages.length + 1)
    setMessages(prev => [...prev, responseMsg])
    updateConversation(currentConvId!)

    setIsLoading(false)
    setSearchQuery('')
    setIsFirstSearch(false)
    console.log(messages)
  }

  // Memoize message components
  const MessageList = useMemo(() => 
    messages.map((message) => (
      message.type === 'query' ? (
        <QuestionCard key={message.id} currentQuery={message.content} />
      ) : (
        <ResponseCard key={message.id} content={message.content} />
      )
    )), [messages]
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
          className={`fixed ${
            isFirstSearch ? 'top-1/2 -translate-y-1/2' : 'bottom-8'
          } left-1/2 -translate-x-1/2 w-full max-w-3xl`}
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

