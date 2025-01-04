import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_KEY
)

export async function POST(request) {
  const { query } = await request.json()
  const { pipeline } = await import('@xenova/transformers')
  const embeddingModel = await pipeline('feature-extraction', 'Xenova/all-mpnet-base-v2')
  
  const query_embedding = await embeddingModel(query)

  const { data: posts } = await supabase.rpc('hybrid_search', {
    query_text: query,
    query_embedding: query_embedding.tolist(),
    full_text_weight: 0.2,
    semantic_weight: 1,
    match_count: 5,
  })

  return NextResponse.json({
    posts: posts.map(post => post["text"])
  })
}








