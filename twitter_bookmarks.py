import tweepy
import json
import os
import webbrowser
from dotenv import load_dotenv
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import parse_qs, urlparse
from threading import Thread

load_dotenv()
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'  # Allow OAuth without HTTPS for local dev

class CallbackHandler(BaseHTTPRequestHandler):
    callback_url = None
    
    def do_GET(self):
        CallbackHandler.callback_url = 'http://127.0.0.1:8000' + self.path
        self.send_response(200)
        self.send_header('Content-type', 'text/html')
        self.end_headers()
        self.wfile.write(b"Authorization successful! You can close this window.")
        
    def log_message(self, format, *args):
        # Suppress logging
        pass

def authenticate():
    server = HTTPServer(('127.0.0.1', 8000), CallbackHandler)
    server_thread = Thread(target=server.serve_forever)
    server_thread.daemon = True
    server_thread.start()
    
    oauth2_user_handler = tweepy.OAuth2UserHandler(
        client_id=os.getenv('CLIENT_ID'),
        client_secret=os.getenv('CLIENT_SECRET'),
        redirect_uri="http://127.0.0.1:8000",
        scope=["bookmark.read", "tweet.read", "users.read"]
    )
    
    print("Opening browser for authorization...")
    webbrowser.open(oauth2_user_handler.get_authorization_url())
    
    while CallbackHandler.callback_url is None:
        pass
    
    server.shutdown()
    access_token = oauth2_user_handler.fetch_token(CallbackHandler.callback_url)
    return tweepy.Client(bearer_token=access_token['access_token'])

def get_bookmarks(client):
    bookmarks = []
    pagination_token = None
    
    while True:
        response = client.get_bookmarks(pagination_token=pagination_token)
        if not response.data:
            break
            
        bookmarks.extend([{
            'id': tweet.id,
            'text': tweet.text,
            'created_at': tweet.created_at.isoformat() if tweet.created_at else None,
            'author_id': tweet.author_id
        } for tweet in response.data])
        
        pagination_token = response.meta.get('next_token')
        if not pagination_token:
            break
    
    return bookmarks

def main():
    client = authenticate()
    print("Fetching bookmarks...")
    bookmarks = get_bookmarks(client)
    with open('bookmarks.json', 'w', encoding='utf-8') as f:
        json.dump(bookmarks, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(bookmarks)} bookmarks to bookmarks.json")

if __name__ == '__main__':
    main() 