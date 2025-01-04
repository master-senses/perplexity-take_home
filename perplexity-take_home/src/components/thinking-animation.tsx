'use client'

import { motion } from 'framer-motion'
import { Dancing_Script } from 'next/font/google'

const cursive = Dancing_Script({ subsets: ['latin-ext'] })

export function ThinkingAnimation() {
  const letters = "thinking...".split("")
  
  return (
    <div className="flex justify-center items-center">
      <div className="flex items-center space-x-1">
        {letters.map((letter, index) => (
          <motion.span
            key={index}
            initial={{ color: "rgb(75, 85, 99)" }}
            animate={{ color: ["rgb(75, 85, 99)", "rgb(255, 255, 255)", "rgb(75, 85, 99)"] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              delay: index * 0.1,
            }}
            className={`text-2xl ${cursive.className}`}
          >
            {<i>{letter}</i>}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

