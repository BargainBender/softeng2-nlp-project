from flask import Flask, request, jsonify
from pydantic import BaseModel, ValidationError
from typing import List, Optional

app = Flask(__name__)

class User(BaseModel):
    name: str
    localGuide: bool

class ReviewItem(BaseModel):
    user: User
    rating: str
    date: str
    review: str

@app.route('/receive_json', methods=['POST'])
def receive_json():
    try:
        data = request.get_json()
        if not data:
            raise ValueError("No data provided")
        
        # Filter out null values
        filtered_data = [item for item in data if item is not None]
        
        # Validate and parse data
        review_items = [ReviewItem(**item) for item in filtered_data]
        
        print('Received Review Items:', review_items)
        
        response = {
            "message": "JSON data received successfully",
            "received_data": [item.dict() for item in review_items]
        }
        return jsonify(response), 200
    except (ValidationError, ValueError) as e:
        return jsonify({"error": str(e)}), 400

if __name__ == '__main__':
    app.run(port=5000)
