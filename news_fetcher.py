import requests
import csv
import sys

def fetch_and_save_news(api_key):
    """Fetches news from NewsAPI and saves it to a CSV file."""
    query = 'supply chain'
    url = f"https://newsapi.org/v2/everything?q={query}&apiKey={'632c3a043fe44b4e84131fffadc3916b'}&language=en&sortBy=publishedAt&pageSize=10"

    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for bad status codes
        articles = response.json().get("articles", [])

        if not articles:
            print("No articles found.")
            return

        # Define the path for the output file
        output_file = 'news_articles.csv'
        
        # Write the articles to the CSV file
        with open(output_file, 'w', newline='', encoding='utf-8') as file:
            writer = csv.writer(file)
            # Write header
            writer.writerow(['headline', 'description', 'date', 'source'])
            # Write article data
            for article in articles:
                writer.writerow([
                    article.get('title', ''),
                    article.get('description', ''),
                    article.get('publishedAt', ''),
                    article.get('source', {}).get('name', '')
                ])
        
        print(f"Successfully saved {len(articles)} articles to {output_file}")

    except requests.exceptions.RequestException as e:
        print(f"Error fetching news: {e}")
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python news_fetcher.py 632c3a043fe44b4e84131fffadc3916b")
    else:
        api_key_arg = sys.argv[1]
        fetch_and_save_news(api_key_arg)