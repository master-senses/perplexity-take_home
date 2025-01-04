'use client'

import { motion } from 'framer-motion'

interface SearchResponseProps {
  response: string
}

export function SearchResponse({ response }: SearchResponseProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-8 p-6 rounded-xl bg-white/5 backdrop-blur-lg"
    >
      <p className="text-gray-200 leading-relaxed">{response}</p>
    </motion.div>
  )
}

