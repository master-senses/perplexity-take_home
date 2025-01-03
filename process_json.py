import json
import re

def clean_text(text):
    if not isinstance(text, str):
        return text
    # Remove or replace problematic characters
    text = text.encode('ascii', 'ignore').decode()  # Remove non-ASCII
    text = text.replace('\u2028', ' ')  # Replace line separator
    text = text.replace('\u2029', ' ')  # Replace paragraph separator
    text = ' '.join(text.split())  # Normalize whitespace
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
    
    # Create new data structure
    processed_data = []
    
    # Process each entry
    for entry in bookmarks:
        new_entry = entry.copy()  # Create a copy of the original entry
        
        # Construct tweet URL from ID
        tweet_id = new_entry.get('id')
        if tweet_id:
            new_entry['link_to_post'] = f"https://twitter.com/i/web/status/{tweet_id}"
        
        # Split author into name and username
        author_data = new_entry['author'].split("\n")
        # print(author_data)
        new_entry['author_name'] = author_data[0]
        new_entry['author_handle'] = author_data[1]
        del new_entry['author']
        # Remove status link from links array
        new_entry['links'] = [
            link for link in new_entry.get('links', [])
            if not re.search(r'/status/\d+/?$', link)
        ]
        # Clean the entry
        new_entry = clean_entry(new_entry)
        processed_data.append(new_entry)
    
    # Save processed data
    with open('data.json', 'w', encoding='utf-8') as f:
        json.dump(processed_data, f, indent=2, ensure_ascii=True)  # Use ASCII-only encoding

if __name__ == '__main__':
    process_bookmarks() 