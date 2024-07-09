# sentiment_model.py

from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification

class SentimentAnalyzer:
    def __init__(self, model_name="nlptown/bert-base-multilingual-uncased-sentiment", max_chunk_size=512):
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)
        self.model = AutoModelForSequenceClassification.from_pretrained(model_name)
        self.sentiment_analysis = pipeline("sentiment-analysis", model=self.model, tokenizer=self.tokenizer, framework="pt")
        self.max_chunk_size = max_chunk_size

    def calculate_tokens_count(self, texts):
        return [len(self.tokenizer.encode(text, add_special_tokens=True)) for text in texts]

    def split_into_chunks(self, text):
        return [text[i:i + self.max_chunk_size] for i in range(0, len(text), self.max_chunk_size)]

    def analyze_sentiment(self, texts, aspects):
        results = []

        for aspect in aspects:
            total_score = 0.0
            num_chunks = 0

            for text in texts:
                chunks = self.split_into_chunks(text)
                for chunk in chunks:
                    aspect_text = f"{aspect}: {chunk}"

                    # Perform sentiment analysis
                    sentiment = self.sentiment_analysis(aspect_text)[0]

                    # Accumulate score based on sentiment label
                    label = sentiment['label']
                    if label in ['1 star', '2 stars']:
                        score = 0.0  # Consider these as NEGATIVE
                    elif label in ['5 stars', '4 stars']:
                        score = 1.0  # Consider '5 stars' as POSITIVE
                    else:
                        score = 0.5  # Default to neutral sentiment

                    total_score += score
                    num_chunks += 1

            # Calculate average score
            average_score = total_score / num_chunks if num_chunks > 0 else 0.0

            # Determine final sentiment based on average score
            if average_score >= 0.5:
                final_sentiment = 'POSITIVE'
            else:
                final_sentiment = 'NEGATIVE'

            results.append({
                'aspect': aspect,
                'final_sentiment': final_sentiment,
                'confidence_score': average_score  # Keeping the average score as confidence score
            })

        return results
