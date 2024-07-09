import pickle
from collections import defaultdict
from sentiment_model import SentimentAnalyzer
import re
from nltk import pos_tag
from nltk.tokenize import word_tokenize
import nltk
from nltk.corpus import wordnet as wn  # Import WordNet from NLTK

# Download NLTK resources if not already downloaded
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')
nltk.download('wordnet')  # Download WordNet data

# Function to filter out non-adjective words
def filter_adjectives(text):
    words = word_tokenize(text)
    tagged_words = pos_tag(words)
    adjectives = [word.lower() for word, tag in tagged_words if tag.startswith('JJ')]  # Keep only adjectives
    return ' '.join(adjectives)

# Function to check if a word is a food noun using NLTK's WordNet
def if_food(word):
    synsets = wn.synsets(str(word), pos=wn.NOUN)
    for syn in synsets:
        if 'food' in syn.lexname():
            return True
    return False

# Preprocess text to remove punctuation and handle possessives
def preprocess_text(text):
    text = re.sub(r'[^\w\s]', '', text)  # Remove punctuation
    text = re.sub(r'\b(\w+)(\'s)\b', r'\1', text)  # Remove possessive 's
    return text.lower()  # Convert to lowercase for consistency

# Load the sentiment analyzer model
with open('models/sentiment_analyzer.model', 'rb') as f:
    analyzer = pickle.load(f)

# Sample texts with potential aspects mentioned within them
texts = [
    "Jollibee Manila never disappoints with its crispy Chickenjoy and flavorful spaghetti. Always my go-to for a quick and satisfying meal!",
    "Love the friendly service at Jollibee Manila. Burgers are juicy, fries are crispy—perfect combo for a quick lunch.",
    "Jollibee Manila's peach mango pie is a delightful treat! Always fresh and perfectly sweet.",
    "Great ambiance and clean surroundings at Jollibee Manila. The burgers are tasty and the prices are reasonable.",
    "Jollibee Manila's breakfast menu is a winner! Tapsilog and hot chocolate—what a delicious way to start the day.",
    "The service at Jollibee Manila was slow and the food was cold.",
    "I was disappointed with the quality of the burgers at Jollibee Manila.",
    "Jollibee Manila's prices are too high for the portion sizes.",
    "The ambiance at Jollibee Manila was noisy and uncomfortable.",
    "I had a bad experience with the customer service at Jollibee Manila."
]

# Define a list of stopwords (non-subject and non-verb words)
stopwords = [
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 
    'aren\'t', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 
    'both', 'but', 'by', 'can', 'can\'t', 'cannot', 'could', 'couldn\'t', 'did', 'didn\'t', 
    'do', 'does', 'doesn\'t', 'doing', 'don\'t', 'down', 'during', 'each', 'few', 'for', 
    'from', 'further', 'had', 'hadn\'t', 'has', 'hasn\'t', 'have', 'haven\'t', 'having', 
    'he', 'he\'d', 'he\'ll', 'he\'s', 'her', 'here', 'here\'s', 'hers', 'herself', 'him', 
    'himself', 'his', 'how', 'how\'s', 'i', 'i\'d', 'i\'ll', 'i\'m', 'i\'ve', 'if', 'in', 
    'into', 'is', 'isn\'t', 'it', 'it\'s', 'its', 'itself', 'let\'s', 'me', 'more', 'most', 
    'mustn\'t', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 
    'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan\'t', 
    'she', 'she\'d', 'she\'ll', 'she\'s', 'should', 'shouldn\'t', 'so', 'some', 'such', 
    'than', 'that', 'that\'s', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 
    'there', 'there\'s', 'these', 'they', 'they\'d', 'they\'ll', 'they\'re', 'they\'ve', 
    'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 
    'wasn\'t', 'we', 'we\'d', 'we\'ll', 'we\'re', 'we\'ve', 'were', 'weren\'t', 'what', 
    'what\'s', 'when', 'when\'s', 'where', 'where\'s', 'which', 'while', 'who', 'who\'s', 
    'whom', 'why', 'why\'s', 'with', 'won\'t', 'would', 'wouldn\'t', 'you', 'you\'d', 
    'you\'ll', 'you\'re', 'you\'ve', 'your', 'yours', 'yourself', 'yourselves'
]

# Function to get the main subject of each sentence
def get_main_subject(text):
    words = word_tokenize(text)
    tagged_words = pos_tag(words)
    main_subject = ""
    for word, tag in tagged_words:
        if tag.startswith('NN'):  # Check if the word is a noun
            main_subject = word.lower()  # Use the first noun encountered as the main subject
            break
    return main_subject

# Count occurrences of each type of aspect across all texts
word_count = defaultdict(int)
food_count = defaultdict(int)
adjective_count = defaultdict(int)

for text in texts:
    preprocessed_text = preprocess_text(text)
    filtered_text = filter_adjectives(preprocessed_text)
    words = preprocessed_text.split()
    filtered_words = filtered_text.split()

    for word in words:
        if word.lower() not in stopwords:
            word_count[word.lower()] += 1
            if if_food(word):
                food_count[word.lower()] += 1

    for word in filtered_words:
        if word.lower() not in stopwords:
            adjective_count[word.lower()] += 1

# Sort aspects by their count (frequency)
sorted_aspects = sorted(word_count.items(), key=lambda x: x[1], reverse=True)
sorted_food_aspects = sorted(food_count.items(), key=lambda x: x[1], reverse=True)
sorted_adjective_aspects = sorted(adjective_count.items(), key=lambda x: x[1], reverse=True)

# Extract aspects in the sorted order (excluding stopwords)
food_aspects = [aspect for aspect, count in sorted_food_aspects]
adjective_aspects = [aspect for aspect, count in sorted_adjective_aspects]

# Analyze sentiment based on food nouns and adjectives
food_results = analyzer.analyze_sentiment(texts, food_aspects)
adjective_results = analyzer.analyze_sentiment(texts, adjective_aspects)

# Print unfiltered aspects
print("Unfiltered Aspects:")
for aspect, count in sorted_aspects:
    print(aspect, count)

# Print food aspects
print("\nFood Aspects:")
for aspect, count in sorted_food_aspects:
    print(aspect, count)

# Print adjective aspects
print("\nAdjective Aspects:")
for aspect, count in sorted_adjective_aspects:
    print(aspect, count)

# Print sentiment analysis results for food nouns
print("\nSentiment Analysis Results for Food Nouns:")
for result in food_results:
    print(f"Sentiment for '{result['aspect']}': {result['final_sentiment']} with confidence score {result['confidence_score']:.2f}")

# Print sentiment analysis results for adjectives
print("\nSentiment Analysis Results for Adjectives:")
for result in adjective_results:
    print(f"Sentiment for '{result['aspect']}': {result['final_sentiment']} with confidence score {result['confidence_score']:.2f}")

# Print main subject of each sentence
print("\nMain Subjects of Each Sentence:")
for text in texts:
    main_subject = get_main_subject(text)
    print(f"Main subject: {main_subject}")
