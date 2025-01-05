import { Source } from "./tweet"

export interface Message {
    id: string
    type: 'query' | 'response'
    content: string
    sources: Source[]
  }
  
export interface Conversation {
    id: string;
    messages: Message[];
    created_at: string;
    updated_at: string;
  }