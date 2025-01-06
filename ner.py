import spacy
import json
from typing import List, Dict
import numpy as np
from collections import defaultdict
import re
from openai import OpenAI
import os
import dotenv

dotenv.load_dotenv()

def load_bookmarks(file_path: str) -> List[Dict]:
    with open(file_path, 'r', encoding='utf-8') as f:
        return json.load(f)
    
class ContextualChunker:
    def __init__(self, max_chunk_size: int = 512, embedding_model: str = "all-mpnet-base-v2"):
        self.nlp = spacy.load("en_core_web_sm")
        self.max_chunk_size = max_chunk_size
        self.client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        
    def extract_entities(self, text: str) -> Dict:
        """Extract named entities and technical terms from text."""
        doc = self.nlp(text)
        entities = defaultdict(list)
        
        for ent in doc.ents:
            entities[ent.label_].append({
                'text': ent.text,
                'start': ent.start_char,
                'end': ent.end_char
            })
        
        concepts = self.extract_technical_concepts(text)
        entities['TECH'] = concepts

        return entities

    def extract_technical_concepts(self, text: str) -> List[str]:
        """Extract general technical concepts."""
        concepts = []
        
        TECH_PATTERNS = {
            'tools': [r'(?i)\b(git|docker|kubernetes|jenkins|terraform)\b'],
            'programming': [r'(?i)\b(python|javascript|java|rust|go|typescript)\b'],
            'concepts': [r'(?i)\b(api|sdk|cli|ui|ux|frontend|backend)\b'],
            'data': [r'(?i)\b(sql|nosql|database|cache|index)\b'],
            'cloud': [r'(?i)\b(aws|azure|gcp|cloud)\b'],
            'ml': [r'(?i)\b(ml|ai|model|training|inference|diffusion|generative)\b']
        }
        
        for category, patterns in TECH_PATTERNS.items():
            for pattern in patterns:
                matches = re.finditer(pattern, text)
                concepts.extend(match.group() for match in matches)
        
        return list(set(concepts))

    def create_contextual_chunks(self, bookmark: Dict) -> List[Dict]:
        """Create contextual chunks from a bookmark."""
        text = bookmark['text']
        doc = self.nlp(text)
        entities = self.extract_entities(text)
        
        chunks = []
        current_chunk = []
        current_length = 0
        
        for sent in doc.sents:
            if current_length + len(sent.text) > self.max_chunk_size and current_chunk:
                chunk_text = ' '.join(current_chunk)
                chunks.append(self.create_chunk_with_context(
                    chunk_text, bookmark, entities))
                current_chunk = []
                current_length = 0
            
            current_chunk.append(sent.text)
            current_length += len(sent.text)
        
        if current_chunk:
            chunk_text = ' '.join(current_chunk)
            chunks.append(self.create_chunk_with_context(
                chunk_text, bookmark, entities))
        
        return chunks

    def create_chunk_with_context(self, text: str, bookmark: Dict, entities: Dict) -> Dict:
        """Create a chunk with preserved context."""
        media_context = {
            'images': bookmark.get('images', []),
            'links': bookmark.get('links', []),
            'link_to_post': bookmark.get('link_to_post')
        }
        
        return {
            'id': f"{bookmark.get('id')}_chunk_{hash(text) % 10000}",
            'text': text,
            'context': {
                'original_id': bookmark.get('id'),
                'author_name': bookmark.get('author_name'),
                'author_handle': bookmark.get('author_handle'),
                'timestamp': bookmark.get('timestamp'),
                'entities': entities,
                'has_images': len(media_context.get('images', [])) > 0,
                'has_links': len(media_context.get('links', [])) > 0,
                'media': media_context
            },
            'metadata': {
                'chunk_length': len(text),
                'entity_types': list(entities.keys())
            }
        }

    def generate_embeddings(self, chunk: Dict) -> Dict:
        """Generate embeddings for a chunk."""
        text_parts = [chunk['text']]
        
        if 'TECH' in chunk['context']['entities']:
            tech_terms = ' '.join(chunk['context']['entities']['TECH'])
            text_parts.append(f"TECHNICAL_TERMS: {tech_terms}")
        
        for entity_type, entities in chunk['context']['entities'].items():
            if entity_type != 'TECH':
                entity_texts = [e['text'] for e in entities if isinstance(e, dict)]
                if entity_texts:
                    text_parts.append(f"{entity_type}: {' '.join(entity_texts)}")
        
        rich_text = " | ".join(text_parts)
        response = self.client.embeddings.create(
            model="text-embedding-ada-002",
            input=rich_text
        )
        embedding = response.data[0].embedding
        chunk['embedding'] = embedding
        return chunk

def process_bookmarks(bookmarks: List[Dict]) -> List[Dict]:
    """Process all bookmarks into contextual chunks with embeddings."""
    chunker = ContextualChunker()
    all_chunks = []
    
    for bookmark in bookmarks:
        chunks = chunker.create_contextual_chunks(bookmark)
        embedded_chunks = [chunker.generate_embeddings(chunk) for chunk in chunks]
        all_chunks.extend(embedded_chunks)
        
    return all_chunks

if __name__ == "__main__":
    bookmarks = load_bookmarks('data.json')
    chunks = process_bookmarks(bookmarks)
    
    with open('processed_chunks.json', 'w', encoding='utf-8') as f:
        json.dump(chunks, f, indent=2)
    
    print(f"Processed {len(bookmarks)} bookmarks into {len(chunks)} chunks")