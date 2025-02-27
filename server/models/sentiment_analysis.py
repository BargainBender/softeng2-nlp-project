import os
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

import pickle
from collections import defaultdict
import re
from nltk import pos_tag, word_tokenize
import nltk
from nltk.corpus import wordnet as wn
from multiprocessing import Pool, cpu_count

# Download NLTK resources if not already downloaded
nltk.download('punkt')
nltk.download('averaged_perceptron_tagger')
nltk.download('wordnet')

def create_array(path):
    words = []
    # Open the file in read mode
    with open(path, 'r') as file:
        # Read each line (which contains one word) and strip any extra whitespace
        for line in file:
            word = line.strip()
            words.append(word)  # Add the word to the list
    return words

food_aspects = create_array('models/food.txt')
service_aspects = create_array('models/service.txt')
atmosphere_aspects = create_array('models/atmosphere.txt')

# food_aspects = [ 'wings', 'pork', 'beef', 'food', 'chicken', 'plate', 'taste', 'sauce', 'tables', 'wing', 'bit', 'foods', 'porks', 'beefs', 'table', 'serving', 'leftovers', 'sauces']
# service_aspects = [ 'service', 'cashier', 'attentively', 'staff', 'listening', 'dazed', 'unattentive']
# atmosphere_aspects = [ 'place', 'atmosphere', 'overall', 'clean', 'infested', 'unsanitary', 'cockroach', 'restaurant']

# Load the sentiment analyzer model
with open('models/sentiment_analyzer.model', 'rb') as f:
    analyzer = pickle.load(f)

# Define a list of stopwords
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

# Function to filter out non-adjective words
def filter_adjectives(text):
    words = word_tokenize(text)
    tagged_words = pos_tag(words)
    adjectives = [word.lower() for word, tag in tagged_words if tag.startswith('JJ')]
    return ' '.join(adjectives)

# Function to check if a word is a food noun using NLTK's WordNet
food_cache = {}
def if_food(word):
    if word in food_cache:
        return food_cache[word]
    
    synsets = wn.synsets(str(word), pos=wn.NOUN)
    for syn in synsets:
        if 'food' in syn.lexname():
            food_cache[word] = True
            return True
    food_cache[word] = False
    return False

# Preprocess text to remove punctuation and handle possessives
def preprocess_text(text):
    text = re.sub(r'[^\w\s]', '', text)  # Remove punctuation
    text = re.sub(r'\b(\w+)(\'s)\b', r'\1', text)  # Remove possessive 's
    return text.lower()  # Convert to lowercase for consistency

# Function to analyze sentiment based on given reviews and aspects
def analyze_sentiment(reviews):
    word_count = defaultdict(int)
    food_count = defaultdict(int)
    adjective_count = defaultdict(int)

    for text in reviews:
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

    sorted_aspects = sorted(word_count.items(), key=lambda x: x[1], reverse=True)
    sorted_food_aspects = sorted(food_count.items(), key=lambda x: x[1], reverse=True)
    sorted_adjective_aspects = sorted(adjective_count.items(), key=lambda x: x[1], reverse=True)

    food_aspects = [aspect for aspect, count in sorted_food_aspects]
    adjective_aspects = [aspect for aspect, count in sorted_adjective_aspects]

    food_results = analyzer.analyze_sentiment(reviews, food_aspects)
    adjective_results = analyzer.analyze_sentiment(reviews, adjective_aspects)

    food_sentiment_avg = aggregate_sentiment(food_results, food_aspects)
    service_sentiment_avg = aggregate_sentiment(adjective_results, service_aspects)
    atmosphere_sentiment_avg = aggregate_sentiment(adjective_results, atmosphere_aspects)

    # Map average sentiment to star ratings
    food_stars = sentiment_to_stars(food_sentiment_avg)
    service_stars = sentiment_to_stars(service_sentiment_avg)
    atmosphere_stars = sentiment_to_stars(atmosphere_sentiment_avg)

    results = {
        # general sentiment
        "unfiltered_aspects": sorted_aspects,
        "adjective_sentiment": adjective_results,
        "adjective_aspects": sorted_adjective_aspects,

        # absa
        "food_sentiment": food_results,

        "food_score": food_stars,
        "service_score": service_stars,
        "atmosphere_score": atmosphere_stars,
        
        # not used at the moment
        # "food_aspects": sorted_food_aspects,
    }


    # Output star ratings
    # print(f"Food: {food_stars} stars")
    # print(f"Service: {service_stars} stars")
    # print(f"Atmosphere: {atmosphere_stars} stars")

    return results

# Function to aggregate sentiment scores for specific categories
def aggregate_sentiment(sentiment_data, category_aspects):
    total_score = 0
    count = 0
    for item in sentiment_data:
        if item['aspect'] in category_aspects:
            total_score += item['confidence_score']
            count += 1
    return total_score / count if count > 0 else 0

# Function to map sentiment score to star ratings
def sentiment_to_stars(score):
    if score >= 0.8:
        return 5
    elif score >= 0.6:
        return 4
    elif score >= 0.4:
        return 3
    elif score >= 0.2:
        return 2
    else:
        return 1



