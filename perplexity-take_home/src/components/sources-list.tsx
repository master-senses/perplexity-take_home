import { Source } from '../types/tweet'
import { TweetCard } from './tweet-card'

interface SourceListProps {
  sources: Source[]
}

export function SourceList({ sources }: SourceListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-5 h-5 opacity-80">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-gray-400"
          >
            <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <h2 className="text-gray-400 text-lg font-sans">Sources</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {sources.map((source, i) => (
          <TweetCard key={i} tweet={source.tweet} url={source.url} />
        ))}
      </div>
    </div>
  )
}