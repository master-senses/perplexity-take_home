'use client'

import { useState, useMemo, useRef } from 'react'
import { ThinkingAnimation } from '../components/thinking-animation'
import { SearchBar } from '../components/search-bar'
import QuestionCard from '@/components/question-card'
import { ResponseCard } from '@/components/response-card'
import { Message}  from '../lib/types'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { createConversation, createMessage, updateConversation, loadMessages, updateMessage } from './services/supabase'
import { useCompletion } from 'ai/react';

import clsx from 'clsx'

export default function SearchEngineInterface() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const conversationId = searchParams.get('conversation')
  const responseIdRef = useRef<string>('')

  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isFirstSearch, setIsFirstSearch] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  // const [currentResponseId, setCurrentResponseId] = useState<string>('')

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
    },
    onFinish: async (prompt, completion) => {
      console.log("the current completion is: ", completion)
      console.log("the current prompt is: ", prompt)
      if (!responseIdRef.current) return;
      await updateMessage(responseIdRef.current, completion)
      setMessages(prev => prev.map(msg => 
        msg.id === responseIdRef.current
          ? {...msg, content: completion}
          : msg
      ))

      setIsLoading(false)
      setSearchQuery('')
      setIsFirstSearch(false)
    }
  });

  const handleSearch = async () => {
    // setCompletion('')
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
    const queryMsg = await createMessage(currentConvId!, searchQuery, 'query', messages.length)
    setMessages(prev => [...prev, queryMsg])
    console.log("I have added ",  queryMsg.content)
    await updateConversation(currentConvId!)

    setIsLoading(true)

    // Create empty response message
    // const  response = "hey this is a sample response for " + searchQuery
    const responseMsg = await createMessage(currentConvId!, '', 'response', messages.length + 1)
    responseIdRef.current = responseMsg.id
    // setCurrentResponseId(responseMsg.id)
    setMessages(prev => [...prev, responseMsg])
    console.log("The message id is: ", responseMsg.id, "The response id is set to: ", responseIdRef.current)
    // console.log("I have added ",  responseMsg.content)
    console.log("The current messages are: ", messages)

    // Get context and start streaming
    const res = await fetch("/api/semantic_search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query: searchQuery}),
    })
    const data = await res.json()
    const stuff = data.context

    // Start streaming completion
    complete(searchQuery, { body: { prompt: searchQuery, context: stuff } })


    setTimeout(() => {}, 300)

    setIsLoading(false)
    setSearchQuery('')
    setIsFirstSearch(false)
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
        />
      )
      
    )), [messages, responseIdRef.current]
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