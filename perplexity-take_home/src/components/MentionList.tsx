import { Mention } from '@/types/mentions'
import { AtSign } from 'lucide-react'

interface MentionListProps {
  mentions: Mention[]
  onSelect: (mention: Mention) => void
  style?: React.CSSProperties
}

export function MentionList({ mentions, onSelect, style }: MentionListProps) {
  if (mentions.length === 0) return null

  return (
    <div 
      className="absolute z-50 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-xl overflow-hidden"
      style={style}
    >
      <div className="max-h-64 overflow-y-auto">
        {mentions.map((mention) => (
          <button
            key={mention.id}
            className="w-full px-4 py-2 flex items-center gap-3 hover:bg-gray-800 transition-colors"
            onClick={() => onSelect(mention)}
          >
            <span className="flex-shrink-0 text-gray-400">
              <AtSign size={18} />
            </span>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-white">{mention.name}</div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

