let data;

document.addEventListener('DOMContentLoaded', async () => {

    const button = document.getElementById('generate-btn');
    const buttonBack = document.getElementById('backButton');
    const mainPage = document.getElementById('transition');

    // Retrieve data from chrome.storage.local
    chrome.storage.local.get(['siteData'], function(result) {
        console.log('Value currently is:', result.siteData);
        data = result.siteData;

        // Check if data exists before initializing the map
        if (data) {
            initializeMapWithData(data.name, data.longtitude, data.latitude);
        } else {
            document.getElementById('generate-btn').style.display = 'none';
            document.querySelector("#map").style.display = 'none';
            document.querySelector("#no-map").style.display = 'block';
            console.log('No data available to initialize map.');
        }
    });

   

    function initializeMapWithData(placeName, long, lat) {
        const map = L.map("map").setView([parseFloat(long), parseFloat(lat)], 14);

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            maxZoom: 19,
        }).addTo(map);

        let marker = L.marker([parseFloat(long), parseFloat(lat)]).addTo(map);
        marker.bindPopup("<b>" + placeName + "</b>").openPopup();
    }

    

  

    if (button != null) {
        button.addEventListener('click', async () => {
            mainPage.classList.add('animate-popup');
            console.log("yo2");

            mainPage.addEventListener('animationend', async () => {
                console.log("yo");
                try {
                    const response = await fetch('http://localhost:8080/scrapeData', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({ url: 'example.com' }) // Adjust with actual data if needed
                    });

                    if (response.ok) {
                        console.log("Scraping completed successfully.");
                        setTimeout(() => {
                            window.location.href = 'generate.html'; // Navigate to generate.html after scraping
                        }, 1000); // Delay to ensure animation completes
                    } else {
                        throw new Error('Scraping process failed.');
                    }
                } catch (error) {
                    console.error("Error occurred during scraping:", error);
                }
            }, { once: true });
        });
    }

    if (buttonBack != null) {
        buttonBack.addEventListener('click', () => {
            mainPage.classList.add('animate-popup-back');
            console.log("Yo");

            mainPage.addEventListener('animationend', async () => {
                setTimeout(() => {
                    window.location.href = 'popup.html';
                }, 1000);
            });
        });
    }

});
