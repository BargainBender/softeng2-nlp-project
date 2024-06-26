
let getName = "";
let getLat;
let getLong;


function handleMessage(message) {
    console.log("handling message");
    if (message.type === 'urlData') {
        console.log('Received URL:', message.data.url);
        console.log('Received Place Name:', message.data.name);
        console.log('Received Longitude:', message.data.longtitude);
        console.log('Received Latitude:', message.data.latitude);

        // Example: Update DOM or perform actions based on received data
        // Update your popup UI with the received data
        getName = message.data.name;
        getLat = message.data.latitude;
        getLong = message.data.longtitude;
    }
}


chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Message received in popup:", message);
    handleMessage(message);
    
});


document.addEventListener('DOMContentLoaded', async () => {


  const button = document.getElementById('generate-btn');
  const buttonBack = document.getElementById('backButton');
  const mainPage = document.getElementById('transition');

    
  const map = L.map("map").setView([51.505, -0.09], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);
  let marker = L.marker([51.505, -0.09]).addTo(map);


    function updateMapWithData(placeName, long, lat) {
        map.setView([parseFloat(lat), parseFloat(long)], 14);
        marker = L.marker([parseFloat(lat), parseFloat(long)]).addTo(map);
        marker.setLatLng([parseFloat(lat), parseFloat(long)]).bindPopup("<b>" + placeName + "</b>").openPopup();
    }

    
    console.log(getName);

  

  


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
    };

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
        
    };
    
   
  
    
});