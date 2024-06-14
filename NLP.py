from flask import Flask, jsonify, request
from flask_cors import CORS
import time
from threading import Timer
from playsound import playsound
import os


app = Flask(__name__)
CORS(app)  
url_timestamp = {}
url_viewtime = {}
prev_url = ""

def url_strip(url):
    if "http://" in url or "https://" in url:
        url = url.replace("https://", '').replace("http://", '').replace('\"', '')
    if "/" in url:
        url = url.split('/', 1)[0]
    return url


banned_tabs = []

#SEND URL
@app.route('/send_url', methods=['POST'])
def send_url():
    resp_json = request.get_data()
    params = resp_json.decode()
    url = params.replace("url=", "")
    print("currently viewing: " + url_strip(url))
    parent_url = url_strip(url)

    global url_timestamp
    global url_viewtime
    global prev_url


    if parent_url not in url_timestamp.keys():
        url_viewtime[parent_url] = 0

    if prev_url != '':
        time_spent = int(time.time() - url_timestamp[prev_url])
        url_viewtime[prev_url] = url_viewtime[prev_url] + time_spent

    x = int(time.time())
    url_timestamp[parent_url] = x
    prev_url = parent_url
    #print("final timestamps: ", url_timestamp)
    #print("final viewtimes: ", url_viewtime)

    return jsonify({'message': 'success!'}), 200


#QUIT APP
@app.route('/quit_url', methods=['POST'])
def quit_url():
    resp_json = request.get_data()
    params = resp_json.decode()
    url = params.replace("url=", "")
    print("currently viewing: " + url_strip(url))
    parent_url = url_strip(url)

    resp_json = request.get_data()
    print("Url closed: " + resp_json.decode())
    return jsonify({'message': 'quit success!'}), 200

app.run(host='0.0.0.0', port=8080)

