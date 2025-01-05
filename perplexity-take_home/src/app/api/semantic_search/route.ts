import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_KEY!
)

export async function POST(request: Request) {
  const { query } = await request.json()

  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      input: query,
      model: 'text-embedding-ada-002'
    })
  });

  const responseData = await response.json();
  if (!responseData.data?.[0]?.embedding) {
    throw new Error('Invalid embedding response');
  }
  const embedding = responseData.data[0].embedding;
  
  const { data: posts } = await supabase.rpc('hybrid_search', {
    query_text: query,
    query_embedding: embedding,
    full_text_weight: 0.2,
    semantic_weight: 1,
    match_count: 5,
  })

  // let context = ""

  // for (const post of posts) {
  //   context += `@${post["context"]["author_handle"]}: ${post["text"]}\n`
  // }

  const context = posts.map((post: any) => ({
    id: post["id"],
    text: post["text"],
    author_handle: post["context"]["author_handle"],
    author_name: post["context"]["author_name"],
    created_at: post["context"]["timestamp"],
    url: post["context"]["media"]["link_to_post"]
  }))

  return NextResponse.json({
    context: context
  })
}