let data;

document.addEventListener('DOMContentLoaded', async () => {

    const button = document.getElementById('generate-btn');
    const buttonBack = document.getElementById('backButton');
    const mainPage = document.getElementById('transition');

    // Retrieve data from chrome.storage.local
    chrome.storage.local.get(['siteData'], function(result) {
        console.log('Value currently is:', result.siteData);
        data = result.siteData;

        if (data != null ) {
            localStorage.setItem('siteDataFE', data.name);
        }

        // Check if data exists before initializing the map
        if (data) {
            initializeMapWithData(data.name, data.longtitude, data.latitude);
        } else {
            document.getElementById('generate-btn').style.display = 'none';
            document.querySelector("#map").style.display = 'none';
            document.querySelector("#no-map").style.display = 'block';
            document.querySelector("#title").style.textAlign ='left';
            document.querySelector("#title h1").style.fontSize = '14px'
            document.querySelector("#footer").style.display ='none';
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
                        const reviewsData = await response.json();

                        localStorage.setItem('reviewsData', JSON.stringify(reviewsData));



                        setTimeout(() => {
                            console.log(data);
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


    const storedReviewsData = JSON.parse(localStorage.getItem('reviewsData'));
    if (storedReviewsData) {


        storedReviewsData.data.data.val_adjective_sentiment.sort((a, b) => {
            if (a.confidence_score > b.confidence_score) return -1;
            if (a.confidence_score < b.confidence_score) return 1;

            if (a.final_sentiment === 'POSITIVE' && b.final_sentiment !== 'POSITIVE') return -1;
            if (a.final_sentiment !== 'POSITIVE' && b.final_sentiment === 'POSITIVE') return 1;

            return 0;  
        });


        //Check if sorted
        storedReviewsData.data.data.val_adjective_sentiment.forEach(element => {
            console.log(element);
        });


        //#region  WORD RATING
        const wordRatingList = document.querySelector("#word-rating ul");

        // Clear existing list items    
        wordRatingList.innerHTML = '';

        // Iterate over sorted data and append to list with different colors
        // Initialize counters for each confidence level
        let highCount = 0;
        let mediumCount = 0;
        let lowCount = 0;
        let badCount = 0;

        storedReviewsData.data.data.val_adjective_sentiment.forEach((element, index) => {
            const liElement = document.createElement('li');
            liElement.textContent = element.aspect; // Example text, replace with your actual content

            if (element.confidence_score >= 0.75 && highCount < 10) {
                liElement.style.backgroundColor = '#C51605'; // High confidence
                highCount++;
            } else if (element.confidence_score >= 0.5 && mediumCount < 10) {
                liElement.style.backgroundColor = '#FD8D14'; // Medium confidence
                mediumCount++;
            } else if (element.confidence_score >= 0.25 && lowCount < 10) {
                liElement.style.backgroundColor = '#FFE17B'; // Low confidence
                lowCount++;
            } else if (element.confidence_score < 0.25 && element.confidence_score >= 0 && badCount < 10) {
                liElement.style.backgroundColor = 'gray'; // Low confidence
                badCount++;
            } else {
                return; // If all categories have reached 10, stop adding more items
            }

            wordRatingList.appendChild(liElement);
        });


        //#endregion

        //#region Common Topics
        const commonTopicsList = document.querySelector("#common-topics");

        // Add the top 4 adjective aspects to the list
        if (commonTopicsList) {
            // Clear existing text content
            commonTopicsList.innerHTML = "<span style='color: #CE1D1D;'>Common Topics:</span> ";
    
            // Add the top 4 adjective aspects to the text content
            const topAspects = storedReviewsData.data.data.val_adjective_aspects.slice(0, 5).map(aspect => aspect[0]).join(', ');
            commonTopicsList.textContent += topAspects;
        } else {
            console.log("Common Topics <li> element not found.");
        }

        //#endregion

        const titleElement = document.querySelector("#resto-title");
        if (JSON.stringify(localStorage.getItem('siteDataFE'))) {
            let siteData = JSON.stringify(localStorage.getItem('siteDataFE'));
            let cleanedName = (siteData.toString()).trim().replace(/\s+/g, ' ');
            if (cleanedName.length > 23) {
                cleanedName = cleanedName.substring(0, 20) + '...';
            }
            

            
            titleElement.textContent = cleanedName;
            
        } else {
            console.log("No data.name available to set #resto-title.");
        }
    

        console.log("Retrieved reviewsData:", storedReviewsData.data.data);



        // Use the retrieved reviewsData as needed
    } else {
        console.log("No reviewsData stored in localStorage.");
    }


});
