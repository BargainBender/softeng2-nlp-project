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
    origin: 'chrome-extension://odpjpahajlncojcdbmcdjndpnndkhbhg'
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

            const response = await axios.post('http://localhost:5000/receive_json', {data: data.data});
            return { success: true, data: response};
        } catch (error) {
            console.error("Error occurred during scraping:", error);
            return { success: false, error: error.message};
        }
    } else {
        console.log("Invalid URL");
        return { success: false, error: error.message};
    }
    
}

// Start server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});