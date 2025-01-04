'use client'

import { useRef, useEffect, useState } from 'react'
import { Search } from 'lucide-react'
import { motion, useAnimate } from 'framer-motion'
import clsx from 'clsx'

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
  const [scope, animate] = useAnimate()
  const [isHovered, setIsHovered] = useState(false)

  useEffect(() => {
    animate(scope.current, { y: [20, 0], opacity: [0, 1], scale: [0.9, 1] }, { duration: 0.3, ease: "easeOut" })
  }, [])

  return (
    <motion.div
      ref={scope}
      className={clsx(
        'w-full max-w-2xl flex items-center justify-center transition-all duration-300',
        !isFirstSearch && 'fixed bottom-8 w-full max-w-2xl'
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
      </div>
    </motion.div>
  )
}



