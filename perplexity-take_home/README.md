# Bookmark Brain 🧠

A personalized semantic search engine for your X (Twitter) bookmarks. Search through your bookmarks using natural language and get contextually relevant results.

<div align="center">
  <img src="public/bookmark-icon.svg" width="100" height="100" />
</div>

```tsx
// Animated bookmark icon
export function BookmarkIcon() {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 32" 
      className="w-24 h-32"
    >
      <path 
        className="stroke-white fill-none stroke-[1.5] animate-[drawBookmark_1.5s_ease-in-out_infinite_alternate]"
        d="M4 2 L4 30 L12 24 L20 30 L20 2 Q20 1 19 1 L5 1 Q4 1 4 2 Z"
      />
    </svg>
  )
}
```

## Setup

1. Create and activate virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # Unix
.\venv\Scripts\activate   # Windows
```

2. Install requirements:
```bash
pip install -r requirements.txt
```

3. Scrape your bookmarks:
```bash
python scrape_bookmarks.py
```

> **Note**: If you have X API Premium access, you can alternatively use:
> ```bash
> python twitter_bookmarks.py
> ```

This will create a `bookmarks.json` file (your data should look like this):
```json
{
  "id": "1803461399286522122",
  "text": "Big step for Generative 3D:\nMeshAnything...",
  "author": "Troy Kirwin\n@tkexpress11",
  "timestamp": "2024-06-19T16:14:38.000Z",
  "images": ["https://pbs.twimg.com/media/GQcubFoaIAQJS1u?format=jpg&name=large"],
  "links": ["https://x.com/tkexpress11/status/1803461399286522122"]
}
```

4. Process the data:
```bash
python process_json.py
```

This creates `data.json` with cleaned format:
```json
{
  "id": "1802376838427394060",
  "text": ". @raffi_hotter and I ran a 2-week hackathon...",
  "timestamp": "2024-06-16T16:24:59.000Z",
  "images": ["https://pbs.twimg.com/media/GQNPJZCaMAAvbMO?format=jpg&name=large"],
  "links": ["https://x.com/raffi_hotter"],
  "link_to_post": "https://twitter.com/i/web/status/1802376838427394060",
  "author_name": "marley",
  "author_handle": "@_marleyx"
}
```
