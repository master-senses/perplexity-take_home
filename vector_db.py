# from supabase import create_client
import numpy as np
from typing import List, Dict
import json

import os
from supabase import create_client, Client
from ner import ContextualChunker

from dotenv import load_dotenv
load_dotenv()

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_KEY")
supabase: Client = create_client(url, key)


def load_bookmarks(file_path: str) -> List[Dict]:
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)

# Create table with vector column
"""
create extension vector;

create table chunks (
  id text primary key,
    text text,
    embedding vector(768),
    context jsonb,
    metadata jsonb
);

create index on chunks 
using ivfflat (embedding vector_cosine_ops)
with (lists = 100);
"""

# Insert
def store_chunk(chunk):
    # Convert numpy array to list if it exists
    if isinstance(chunk['embedding'], np.ndarray):
        chunk['embedding'] = chunk['embedding'].tolist()

    supabase.table('chunks').insert({
        'id': chunk['id'],
        'text': chunk['text'],
        'embedding': chunk['embedding'],  # Now it's a list
        'context': {
            'original_id': chunk['context']['original_id'],
            'author': chunk['context']['author'],
            'timestamp': chunk['context']['timestamp'],
            'entities': chunk['context']['entities'],
            'has_images': chunk['context']['has_images'],
            'has_links': chunk['context']['has_links'],
            'media': chunk['context']['media']
        },
        'metadata': chunk['metadata']
    }).execute()
# Query
def search_similar(query, type):
    chunker = ContextualChunker()
    if type == "technical":
        query_embedding = chunker.embedding_model.encode(
                f"{query} | TECHNICAL_TERMS: {query}"
            )
    else:
        query_embedding = chunker.embedding_model.encode(
                query
            )

    return supabase.rpc(
        'match_chunks',
        {'query_embedding': query_embedding.tolist(), 'match_threshold': 0.3, 'match_count': 5}
    ).execute()

bookmarks = load_bookmarks('processed_chunks.json')

# for bookmark in bookmarks:
#     store_chunk(bookmark)

# print(search_similar("what should I include in my .cursorrules file?", "technical"))


cont = ContextualChunker()
query = "are there any new advances in gaussian splatting"
embedding = cont.embedding_model.encode(query)
# Call hybrid_search Postgres function via RPC
response = supabase.rpc('hybrid_search', {
    'query_text': query,
    'query_embedding': embedding.tolist(),
    'full_text_weight': 0.2,
    'semantic_weight': 1,
    'match_count': 5,
    # 'author_filter': "dreaming tulpa"

}).execute()

documents = response.data

for i in range(len(documents)):
    print(f"{i + 1}th text: ", documents[i]["text"], " | ", documents[i]["context"]["author"], " | ", documents[i]["context"]["media"]["link_to_post"])

# print(json.dumps(documents))


