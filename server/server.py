from flask import Flask, request, jsonify
from pydantic import BaseModel, ValidationError, validator
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
        # Parse and validate JSON data using Pydantic models
        data = request.get_json()
        print(data)
        
        #json_data = [item for obj in data]
        #print(json_data)
        

        # Parse and validate the cleaned data
        review_items = []
        for item in data:
            review_items.append(item)
        #     # review_items = [item in data["data"]]
            
        print(review_items)

        # If you want to convert back to JSON, use .dict() method
        # review_items_json = [item.dict() for item in review_items]

        return jsonify({'message': 'JSON data received successfully', 'data': data}), 200
    except ValidationError as e:
        return jsonify({'message': 'Validation error', 'errors': e.errors()}), 400
    except Exception as e:
        print('Error:', e)
        return jsonify({'message': 'Error processing JSON data', 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
