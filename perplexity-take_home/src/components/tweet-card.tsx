'use client'

import { Tweet } from '../types/tweet'
import { formatDistanceToNow } from 'date-fns'

interface TweetCardProps {
  tweet: Tweet
  url: string
}

export function TweetCard({ tweet, url }: TweetCardProps) {
  const formattedDate = formatDistanceToNow(new Date(tweet.created_at), { addSuffix: true })
//   console.log("The url is: ", url)

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block bg-gray-800 rounded-xl p-4 hover:bg-gray-750 transition-colors h-full cursor-pointer"
    >
      <div className="flex flex-col h-full hover:opacity-80 transition-opacity">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <p className="font-medium text-white text-sm truncate">
              {tweet.author.name}
            </p>
            <p className="text-gray-400 text-xs">
              {tweet.author.username}
            </p>
          </div>
        </div>
        <p className="text-white text-sm line-clamp-4 mb-2 flex-grow">{tweet.text}</p>
        <div className="flex items-center justify-between text-gray-400 text-xs">
          <span>{formattedDate}</span>
        </div>
      </div>
    </a>
  )
}

