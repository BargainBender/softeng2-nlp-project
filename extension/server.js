const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); 
const scrapeFunction = require('./scrape.js');
const axios = require('axios');

const app = express();
const port = 8080;

let storedUrl = ''


let storedData;

// Middleware to parse request bodies
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(cors({
    origin: 'chrome-extension://jhhlolconannaeolindgmlnbdefdagcc'
}));

// Endpoint to receive URL from fetch request
app.post('/send_url', (req, res) => {
    const { url, placeName, long, lat } = req.body;
    console.log('URL:', url);
    console.log('Place Name:', placeName);
    console.log('Longitude:', long);
    console.log('Latitude:', lat);

    if (url != storedUrl){
        storedUrl = url;
    }
    storedData = {
        myURL: url,
        name: placeName,
        longitude: long,
        latitude: lat
    }

    console.log(storedData);
    // Send the response with the received data
    //Some what obsolete, I didnt use the send
    res.status(200).send({
        message: 'Data received successfully',
        data: {
            url,
            placeName,
            longitude: long,
            latitude: lat
        }
    });

    
});

// Endpoint to handle quitting URL
app.post('/quit_url', (req, res) => {
    const url = req.body.url;
    console.log('Quitting URL:', url);
    storedUrl = '';
    // Process the quitting URL as needed (e.g., cleanup)
    res.sendStatus(200); // Respond with success status
});

app.post('/scrapeData', async (req, res) => {
    try {
        // Ensure storedUrl is not empty and execute scraping
        if (storedUrl) {
            let result = await executeScraping(storedUrl);
            // console.log("Server.js Data: " + res.jsonData);
            res.json({ success: true, data: result});
        } else {
            throw new Error("Invalid URL or no URL provided.");
        }
    } catch (error) {
        console.error('Error during scraping:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});



async function executeScraping(url) {
    if (storedUrl != '') {
        try {
            const data = await scrapeFunction(url);
            console.log("Scraping completed successfully.");
            console.log("Server.js Data: " + data);

            const response = await axios.post('http://127.0.0.1:5000/receive_json', data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            console.log(response.data);
            //console.log(JSON.stringify(response.data));

            let val_food_aspects = [];
            let val_unfiltered_aspects =[];
            let val_adjective_aspects = [];
            let val_food_sentiment = [];
            let val_adjective_sentiment = [];
            let val_food_scores = [];
            let val_service_scores = [];
            let val_atmosphere_scores = [];

            if (Array.isArray(response.data.data)) {
                // Iterate through each batch in response.data.data
                response.data.data.forEach(batch => {
                    console.log(batch)
                    //console.log(`\n\nBatch Number: ${batch.batch_number}`);
            
                    // Check if sentiment_results exist for this batch
                    if (batch.sentiment_results) {
                        // Push values into respective arrays
                        if (batch.sentiment_results.unfiltered_aspects) {
                            val_unfiltered_aspects.push(batch.sentiment_results.unfiltered_aspects);
                        }
                        if (batch.sentiment_results.food_aspects) {
                            val_food_aspects.push(batch.sentiment_results.food_aspects);
                        }
                        if (batch.sentiment_results.adjective_aspects) {
                            val_adjective_aspects.push(batch.sentiment_results.adjective_aspects);
                        }
                        if (batch.sentiment_results.food_sentiment) {
                            val_food_sentiment.push(batch.sentiment_results.food_sentiment);
                        }
                        if (batch.sentiment_results.adjective_sentiment) {
                            val_adjective_sentiment.push(batch.sentiment_results.adjective_sentiment);
                        }
                        if (batch.sentiment_results.food_score) {
                            val_food_scores.push(batch.sentiment_results.food_score);
                        }
                        if (batch.sentiment_results.service_score) {
                            val_service_scores.push(batch.sentiment_results.service_score);
                        }
                        if (batch.sentiment_results.atmosphere_score) {
                            val_atmosphere_scores.push(batch.sentiment_results.atmosphere_score);
                        }
                    } else {
                        console.log(`No sentiment_results found for this batch.`);
                    }

                });


            } else {
                console.error('Response data.data is not an array:', response.data.data);
                // Handle the unexpected response structure accordingly
            }

            const val_food_scores_avg = getArrAvg(val_food_scores)
            const val_service_scores_avg = getArrAvg(val_service_scores)
            const val_atmosphere_scores_avg = getArrAvg(val_atmosphere_scores)
            
            const combinedData = {
                val_food_aspects: val_food_aspects.flat(),
                val_unfiltered_aspects: val_unfiltered_aspects.flat(),
                val_adjective_aspects: val_adjective_aspects.flat(),
                val_food_sentiment: val_food_sentiment.flat(),
                val_adjective_sentiment: val_adjective_sentiment.flat(),
                val_food_scores_avg,
                val_service_scores_avg,
                val_atmosphere_scores_avg
            };
            console.log('Combined Data:', combinedData);

            return { success: true, data: combinedData }; // Only return response.data
        } catch (error) {
            console.error("Error occurred during scraping:", error);
            return { success: false, error: error.message};
        }
    } else {
        console.log("Invalid URL");
        return { success: false, error: error.message};
    }
}

function getArrAvg(array) {
    const sum = array.reduce((a, b) => a + b, 0)
    const average = (sum / array.length) || 0

    return average
}

// Start server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});