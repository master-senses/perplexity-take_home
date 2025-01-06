import { Mention } from '@/types/mentions'

// This is a mock list of mentions. In the future, we will get this from the database.
export const mockMentions: Mention[] = [
  { id: '1', name: '@dreamingtulpa'},
  { id: '2', name: '@jxnlco'},
  { id: '3', name: '@naval'},
  { id: '4', name: '@AravSrinivas'},
  { id: '5', name: '@MorrisTao'}
]

export function filterMentions(query: string): Mention[] {
  const searchTerm = query.toLowerCase().replace('@', '')
  return mockMentions.filter(mention => 
    mention.name.toLowerCase().includes(searchTerm)
  )
}

