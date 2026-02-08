import csv
import json
import random
from textblob import TextBlob
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

# --- Domain-Specific Keyword Dictionaries with Weights ---
# These keywords will modify the sentiment score to be more context-aware.
POSITIVE_KEYWORDS = {
    'breakthrough': 0.4, 'growth': 0.3, 'surpasses expectations': 0.3, 'record high': 0.35,
    'successful launch': 0.25, 'expansion': 0.2, 'profitable': 0.3, 'innovation': 0.25,
    'deal': 0.2, 'eases': 0.15, 'upgrade': 0.2
}
NEGATIVE_KEYWORDS = {
    'crisis': -0.4, 'disruption': -0.3, 'lawsuit': -0.35, 'scandal': -0.4, 'bankruptcy': -0.5,
    'plummets': -0.3, 'downturn': -0.3, 'layoffs': -0.25, 'tariffs': -0.2, 'recall': -0.3,
    'investigation': -0.25, 'losses': -0.3
}
IMPACT_KEYWORDS = [
    'acquisition', 'merger', 'IPO', 'federal reserve', 'government regulation', 'cyberattack',
    'bankruptcy', 'breakthrough', 'discovery'
]


def calculate_keyword_modifier(text, keywords):
    """Calculates a score modifier based on the presence of weighted keywords."""
    modifier = 0.0
    text_lower = text.lower()
    for keyword, weight in keywords.items():
        if keyword in text_lower:
            modifier += weight
    return modifier


def analyze_articles_from_csv():
    """Reads articles, performs advanced sentiment analysis, and prints JSON output."""

    # Initialize VADER sentiment analyzer
    analyzer = SentimentIntensityAnalyzer()

    # Expanded Recommendation Lists (same as before)
    positive_recommendations = [
        "Explore opportunities for market expansion presented by this development.",
        "Launch a targeted marketing campaign to capitalize on positive sentiment.",
        "Accelerate product development in related areas to gain a first-mover advantage.",
        "Brief the sales and marketing teams to leverage this news in client conversations.",
        "Consider increasing investment in this sector to maximize gains.",
        "Issue a press release to highlight our company's alignment with this positive trend.",
        "Evaluate potential strategic partnerships to amplify the benefits.",
        "Reward the teams whose work contributed to this positive outcome or aligns with this trend."
    ]
    negative_recommendations = [
        "Initiate the risk assessment protocol immediately to quantify potential exposure.",
        "Activate the crisis communication team to prepare a public statement.",
        "Review supply chain vulnerabilities and identify alternative suppliers.",
        "Stress-test financial models based on this negative outlook.",
        "Place a temporary hold on non-essential spending in affected areas.",
        "Brief legal and compliance teams on potential regulatory impacts.",
        "Prepare contingency plans for potential operational disruptions.",
        "Increase monitoring of competitor reactions and market sentiment."
    ]
    neutral_recommendations = [
        "Monitor market trends and competitor activities related to this news.",
        "Brief the strategic planning team on potential long-term implications.",
        "Continue with current business operations while remaining vigilant.",
        "Schedule a follow-up analysis to track developments in the next quarter.",
        "Conduct an internal survey to gauge team awareness and sentiment on the matter.",
        "Update internal knowledge bases and documentation with this new information.",
        "No immediate action required, but add this to the executive watchlist.",
        "Analyze how this development could indirectly affect adjacent markets or sectors."
    ]

    analyzed_articles = []
    try:
        with open('news_articles.csv', 'r', newline='', encoding='utf-8') as file:
            reader = csv.DictReader(file)
            for row in reader:
                headline = row.get('headline', '')
                description = row.get('description', '')
                full_text = f"{headline}. {description}"

                # --- 1. Advanced Sentiment Calculation ---
                # Get VADER scores for headline and description
                h_scores = analyzer.polarity_scores(headline)
                d_scores = analyzer.polarity_scores(description)

                # Create a weighted average (headlines are more important)
                # VADER's 'compound' score is a great single metric from -1 to 1
                base_sentiment = (h_scores['compound'] * 0.6) + (d_scores['compound'] * 0.4)

                # --- 2. Apply Keyword Modifiers ---
                pos_modifier = calculate_keyword_modifier(full_text, POSITIVE_KEYWORDS)
                neg_modifier = calculate_keyword_modifier(full_text, NEGATIVE_KEYWORDS)
                final_sentiment = base_sentiment + pos_modifier + neg_modifier
                # Clamp the final score to be within [-1, 1]
                final_sentiment = max(-1.0, min(1.0, final_sentiment))

                # --- 3. Dynamic Impact Score Calculation ---
                impact_score = 3 # Start with a base score
                # Increase impact based on sentiment magnitude (strong feelings = high impact)
                impact_score += abs(final_sentiment) * 4
                # Increase impact if specific high-impact keywords are present
                if any(keyword in full_text.lower() for keyword in IMPACT_KEYWORDS):
                    impact_score += 3
                # Clamp the impact score to be within [0, 10]
                impact_score = int(max(0, min(10, impact_score)))
                
                # --- 4. Subjectivity Analysis ---
                subjectivity = TextBlob(full_text).sentiment.subjectivity
                analysis_type = "Opinion/Speculation" if subjectivity > 0.5 else "Factual Report"

                # --- 5. Categorize and Shuffle Recommendations ---
                if final_sentiment > 0.25:  # Higher threshold for positive
                    recommendations = random.sample(positive_recommendations, k=3)
                elif final_sentiment < -0.25:  # Higher threshold for negative
                    recommendations = random.sample(negative_recommendations, k=3)
                else:
                    recommendations = random.sample(neutral_recommendations, k=3)

                analyzed_articles.append({
                    "headline": headline,
                    "date": row.get('date', ''),
                    "source": row.get('source', ''),
                    "impact_score": impact_score,
                    "sentiment": round(final_sentiment, 2),
                    "analysis_type": analysis_type,
                    "subjectivity_score": round(subjectivity, 2),
                    "predicted_effects": {
                        "sales": {"direction": "positive" if final_sentiment > 0.3 else "negative" if final_sentiment < -0.3 else "neutral", "magnitude": int(impact_score * 0.8)},
                        "customer_behavior": {"direction": "positive" if final_sentiment > 0.1 else "negative" if final_sentiment < -0.1 else "neutral", "magnitude": int(impact_score * 0.6)},
                        "workflow": {"direction": "neutral", "magnitude": int(impact_score * 0.5)}
                    },
                    "recommendations": recommendations
                })

        print(json.dumps(analyzed_articles, indent=4))

    except FileNotFoundError:
        print(json.dumps([{"error": "news_articles.csv not found."}]))
    except Exception as e:
        print(json.dumps([{"error": f"An unexpected error occurred: {e}"}]))

if __name__ == "__main__":
    analyze_articles_from_csv()