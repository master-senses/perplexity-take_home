from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
import json
import time
import re

def setup_driver():
    options = webdriver.ChromeOptions()
    options.add_argument('--start-maximized')
    return webdriver.Chrome(options=options)

def extract_images(tweet):
    images = []
    try:
        img_elements = tweet.find_elements(By.CSS_SELECTOR, 'img[alt="Image"]')
        for img in img_elements:
            src = img.get_attribute('src')
            if src and 'profile' not in src:
                src = src.replace('&name=small', '&name=large')
                images.append(src)
    except:
        pass
    return images

def extract_links(tweet):
    links = []
    try:
        link_elements = tweet.find_elements(By.CSS_SELECTOR, 'a')
        for link in link_elements:
            href = link.get_attribute('href')
            if href and 'twitter.com' not in href and not href.startswith('/'):
                links.append(href)
    except:
        pass
    return list(set(links))

def get_tweet_id(tweet):
    try:
        links = tweet.find_elements(By.CSS_SELECTOR, 'a[href*="/status/"]')
        for link in links:
            href = link.get_attribute('href')
            if href and '/status/' in href:
                return href.split('/status/')[1].split('?')[0]
    except:
        pass
    return None

def aggressive_scroll(driver):
    # Scroll multiple times with different speeds
    for _ in range(3):
        driver.execute_script("window.scrollBy(0, 1000);")
        time.sleep(0.5)
    time.sleep(1)
    driver.execute_script("window.scrollBy(0, 2000);")
    time.sleep(2)

def reset_page(driver):
    print("\nResetting page to refresh content...")
    current_url = driver.current_url
    driver.get(current_url)
    time.sleep(5)  # Wait for page to fully load

def scrape_bookmarks():
    driver = setup_driver()
    bookmarks = []
    seen_ids = set()
    stuck_count = 0
    last_reset = 0
    
    try:
        driver.get('https://twitter.com/login')
        print("Please log in to Twitter in the browser window...")
        
        while 'i/bookmarks' not in driver.current_url:
            time.sleep(1)
        
        print("Logged in successfully! Scraping bookmarks...")
        print("Press Ctrl+C to stop scraping and save current progress")
        
        while True:
            tweet_elements = driver.find_elements(By.CSS_SELECTOR, '[data-testid="tweet"]')
            initial_bookmark_count = len(bookmarks)
            
            for tweet in tweet_elements:
                try:
                    tweet_id = get_tweet_id(tweet)
                    if tweet_id and tweet_id not in seen_ids:
                        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", tweet)
                        time.sleep(0.5)
                        tweet_data = {
                            'id': tweet_id,
                            'text': tweet.find_element(By.CSS_SELECTOR, '[data-testid="tweetText"]').text,
                            'author': tweet.find_element(By.CSS_SELECTOR, '[data-testid="User-Name"]').text,
                            'timestamp': tweet.find_element(By.CSS_SELECTOR, 'time').get_attribute('datetime'),
                            'images': extract_images(tweet),
                            'links': extract_links(tweet)
                        }
                        bookmarks.append(tweet_data)
                        seen_ids.add(tweet_id)
                        print(f"Scraped {len(bookmarks)} bookmarks", end='\r')
                except Exception as e:
                    continue
            
            aggressive_scroll(driver)
            
            if len(bookmarks) == initial_bookmark_count:
                stuck_count += 1
                if stuck_count >= 3:
                    # If we're stuck and haven't reset recently
                    if len(bookmarks) - last_reset > 20:
                        reset_page(driver)
                        last_reset = len(bookmarks)
                        stuck_count = 0
                    else:
                        print(f"\nReached the end after {len(bookmarks)} bookmarks")
                        break
            else:
                stuck_count = 0
            
            # Save progress periodically
            if len(bookmarks) % 50 == 0:
                with open('bookmarks_backup.json', 'w', encoding='utf-8') as f:
                    json.dump(bookmarks, f, indent=2, ensure_ascii=False)
    
    except KeyboardInterrupt:
        print("\nScraping interrupted by user. Saving current progress...")
    except Exception as e:
        print(f"\nAn error occurred: {e}")
    finally:
        driver.quit()
        
    return bookmarks

def main():
    bookmarks = scrape_bookmarks()
    with open('bookmarks.json', 'w', encoding='utf-8') as f:
        json.dump(bookmarks, f, indent=2, ensure_ascii=False)
    print(f"\nSaved {len(bookmarks)} bookmarks to bookmarks.json")

if __name__ == '__main__':
    main()