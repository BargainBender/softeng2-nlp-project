from flask import Flask, request, jsonify

app = Flask(__name__)

@app.route('/receive_json', methods=['POST'])
def receive_json():
    try:
        data = request.json.get('data')
        print('Received JSON data:', data)
        # Process the received JSON data as needed
        review_items = [ReviewItem(**item) for item in data]  # Ensure item is a dictionary
        # Further processing...
        return jsonify({'message': 'JSON data received successfully', 'data': data}), 200
    except Exception as e:
        print('Error:', e)
        return jsonify({'message': 'Error processing JSON data', 'error': str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
