import json
import re

def clean_text(text):
    if not isinstance(text, str):
        return text
    text = text.encode('ascii', 'ignore').decode()
    text = text.replace('\u2028', ' ')
    text = text.replace('\u2029', ' ')
    text = ' '.join(text.split())
    return text

def clean_entry(entry):
    cleaned = {}
    for key, value in entry.items():
        if isinstance(value, str):
            cleaned[key] = clean_text(value)
        elif isinstance(value, list):
            cleaned[key] = [clean_text(item) if isinstance(item, str) else item for item in value]
        else:
            cleaned[key] = value
    return cleaned

def process_bookmarks():
    # Read original data
    with open('bookmarks.json', 'r', encoding='utf-8') as f:
        bookmarks = json.load(f)
    
    processed_data = []
    
    for entry in bookmarks:
        new_entry = entry.copy()
        
        tweet_id = new_entry.get('id')
        if tweet_id:
            new_entry['link_to_post'] = f"https://twitter.com/i/web/status/{tweet_id}"
        
        author_data = new_entry['author'].split("\n")
        new_entry['author_name'] = author_data[0]
        new_entry['author_handle'] = author_data[1]
        del new_entry['author']

        new_entry['links'] = [
            link for link in new_entry.get('links', [])
            if not re.search(r'/status/\d+/?$', link)
        ]
        new_entry = clean_entry(new_entry)
        processed_data.append(new_entry)
    
    with open('data.json', 'w', encoding='utf-8') as f:
        json.dump(processed_data, f, indent=2, ensure_ascii=True)

if __name__ == '__main__':
    process_bookmarks() 