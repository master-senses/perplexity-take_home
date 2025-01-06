'use client'

import { useRef, useState, useEffect } from 'react'
import { Search } from 'lucide-react'
import { motion, useAnimate } from 'framer-motion'
import clsx from 'clsx'
import { MentionList } from './MentionList'
import { filterMentions } from '@/lib/mention'
import { Mention } from '@/types/mentions'

interface SearchBarProps {
  searchQuery: string
  isFirstSearch: boolean
  onSearch: () => void
  onChange: (value: string) => void
}

export function SearchBar({
  searchQuery,
  isFirstSearch,
  onSearch,
  onChange,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [scope] = useAnimate()
  const [isHovered, setIsHovered] = useState(false)
  const [mentionSearch, setMentionSearch] = useState<{
    isActive: boolean
    query: string
    startPosition: number
  }>({
    isActive: false,
    query: '',
    startPosition: 0
  })
  const justSelectedMention = useRef(false)

  useEffect(() => {
    if (justSelectedMention.current) {
      justSelectedMention.current = false
      return
    }

    // Check for @ mentions
    const lastAtSymbol = searchQuery.lastIndexOf('@')
    if (lastAtSymbol !== -1) {
      const textAfterAt = searchQuery.slice(lastAtSymbol)
      const spaceAfterAt = textAfterAt.indexOf(' ')
      const query = spaceAfterAt === -1 ? textAfterAt : textAfterAt.slice(0, spaceAfterAt)
      
      setMentionSearch({
        isActive: true,
        query,
        startPosition: lastAtSymbol
      })
    } else {
      setMentionSearch({
        isActive: false,
        query: '',
        startPosition: 0
      })
    }
  }, [searchQuery])

  const handleSelectMention = (mention: Mention) => {
    const beforeMention = searchQuery.slice(0, mentionSearch.startPosition)
    const afterMention = searchQuery.slice(mentionSearch.startPosition).split(' ').slice(1).join(' ')
    const newValue = `${beforeMention}@${mention.name}${afterMention ? ' ' + afterMention : ''}`
    onChange(newValue)
    setMentionSearch({ isActive: false, query: '', startPosition: 0 })
    justSelectedMention.current = true
    inputRef.current?.focus()
  }

  const getMentionListPosition = () => {
    if (!inputRef.current) return {}
    
    const caretPosition = mentionSearch.startPosition * 8 // Approximate character width
    
    return {
      bottom: '100%',
      left: `${caretPosition}px`
    }
  }

  return (
    <motion.div
      ref={scope}
      className={clsx(
        'w-full max-w-2xl flex items-center justify-center transition-all duration-300',
        !isFirstSearch && 'fixed bottom-8 w-full max-w-2xl items-center'
      )}
    >
      <div
        className={clsx(
          'relative bg-white/10 backdrop-blur-lg rounded-full transition-all duration-300',
          isFirstSearch || isHovered ? 'w-full max-w-2xl p-6' : 'w-80 p-4'
        )}
        onMouseEnter={() => !isFirstSearch && setIsHovered(true)}
        onMouseLeave={() => !isFirstSearch && setIsHovered(false)}
      >
        <div className="flex items-center gap-3">
          <Search className="w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="What do you want to know?"
            value={searchQuery}
            onChange={(e) => onChange(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && onSearch()}
            className={`bg-transparent outline-none text-white placeholder-gray-400 flex-1 ${
              isFirstSearch || isHovered ? 'text-lg' : 'text-base'
            }`}
          />
        </div>

        {/* Mention list popup */}
        {mentionSearch.isActive && (
          <MentionList
            mentions={filterMentions(mentionSearch.query)}
            onSelect={handleSelectMention}
            style={getMentionListPosition()}
          />
        )}
      </div>
    </motion.div>
  )
}





