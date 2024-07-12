import sys 
import os
sys.path.append(os.path.abspath("models"))
from models.sentiment_analysis import analyze_sentiment


from flask import Flask, request, jsonify
from pydantic import BaseModel, ValidationError, validator
from typing import List, Optional

def process_reviews(reviews, batch_size):
    results = []

    #print("\n\n BATCHES")
    for i in range(0, len(reviews), batch_size):
        batch_reviews = reviews[i:i + batch_size]

        #print(f"Processing batch {i // batch_size + 1}")
        #print(batch_reviews)

        # Assuming analyze_sentiment returns structured results
        batch_results = analyze_sentiment(batch_reviews)
        results.append({
            'batch_number': i // batch_size + 1,
            'sentiment_results': batch_results
        })

        #print(f"\nExtracted reviews: {batch_results}")

    #print(f"\nSentiment analysis results:")
    for result in results:
        batch_number = result['batch_number']
        sentiment_results = result['sentiment_results']

        #print(f"Batch {batch_number}")
        #print("Sentiment Results:")
        #for key, value in sentiment_results.items():
        #    print(f"- {key}: {value}")

        #print("\n")

    return results

app = Flask(__name__)

BATCH_SIZE = 10

@app.route('/receive_json', methods=['POST'])
def receive_json():
    try:
        data = request.get_json()
        #print(f"Received data: {data}")


        reviews = [item['review'] for item in data if item and 'review' in item]


        results = process_reviews(reviews, BATCH_SIZE);        
        


        #print(f"Sentiment analysis results: {results}")


        return jsonify({'message': 'JSON data received successfully', 'data': results}), 200
    except ValidationError as e:
        return jsonify({'message': 'Validation error', 'errors': e.errors()}), 400
    except Exception as e:
        print('Error:', e)
        return jsonify({'message': 'Error processing JSON data', 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
