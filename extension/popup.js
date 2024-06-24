document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('generate-btn');
  const buttonBack = document.getElementById('backButton');
  const mainPage = document.getElementById('transition');


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