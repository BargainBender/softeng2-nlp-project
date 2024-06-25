function handleMessage(message) {
    if (message.type === 'urlData') {
        const { url, placeName, long, lat } = message.data;
        console.log('Received URL:', url);
        console.log('Received Place Name:', placeName);
        console.log('Received Longitude:', long);
        console.log('Received Latitude:', lat);

        // Example: Update DOM or perform actions based on received data
        // Update your popup UI with the received data
    }
}


document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('generate-btn');
  const buttonBack = document.getElementById('backButton');
  const mainPage = document.getElementById('transition');

  chrome.runtime.getBackgroundPage(function(backgroundPage) {
    console.log("RAYMOND");
    // Access the backgroundPage object and listen for messages
    backgroundPage.chrome.runtime.onMessage.addListener(handleMessage);
});
    
// Initialize map
  var map = L.map("map").setView([14.6022881, 120.9620838], 14);

  //14.6022881,120.9620838,14
  // Add tile layer (OpenStreetMap)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  // Example marker
  var marker = L.marker([14.6022881, 120.9620838]).addTo(map);
  marker.bindPopup("<b>Jollibee</b><br>I am a popup.").openPopup();



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