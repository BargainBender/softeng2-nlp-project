// chrome-extension-backend.js
/*chrome.runtime.sendMessage({
    type: 'urlData',
    data: { url, placeName, long, lat }
});*/
/** ON ENTER */
function callExpressBackend(tab) {
    const mapsUrlPattern = /^https:\/\/www\.google\.com\/maps\/place\/([^\/]+)\/@([^,]+),([^,]+),[^\/]+\/data=!4m\d+!.*!9m1!1b1!.*\?authuser=\d+&hl=\w+&entry=ttu$/;
    const match = tab.url.match(mapsUrlPattern);
    let placeName = '';
    let long = '';
    let lat = '';

    if (match) {
        placeName = match[1].replace(/[^a-zA-Z ]/g, " ").trim(); // This will keep only letters and spaces
        long = match[2];
        lat = match[3];
        console.log('Name:', placeName);
        console.log('Long: ', long);
        console.log('Lat: ', lat);
    } else {
        console.log('URL does not match the pattern.');
    }

    console.log(tab.url);
    if (mapsUrlPattern.test(tab.url)) {
        fetch('http://localhost:8080/send_url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'url=' + encodeURIComponent(tab.url) +
                '&placeName=' + encodeURIComponent(placeName) +
                '&long=' + encodeURIComponent(long) +
                '&lat=' + encodeURIComponent(lat)

        }).then(response => {
            if (response.ok) {
                console.log( {
                    url: tab.url,
                    name: placeName,
                    latitude: lat,
                    longtitude: long
                });
                sendDataToPopup({
                    url: tab.url,
                    name: placeName,
                    latitude: lat,
                    longtitude: long
                });
                console.log('URL sent successfully.');
            } else {
                console.error('Failed to send URL:', response.status, response.statusText);
            }
        }).catch(error => { // Catch any network errors
            console.error('Error:', error);
        });
    } else {
        console.log('URL does not match the pattern. Skipping.');
        chrome.storage.local.set({ siteData: null }, function() {
            console.log('Data saved to chrome.storage.local:', null);
            chrome.runtime.sendMessage({ type: 'urlData', data: null });
        });
    }
}


function sendDataToPopup(data) {
    console.log("Calling Chrome", data);
    chrome.storage.local.set({ siteData: data }, function() {
        console.log('Data saved to chrome.storage.local:', data);
        chrome.runtime.sendMessage({ type: 'urlData', data: data });
    });

    //localStorage.setItem('siteData', data);
    //chrome.runtime.sendMessage({ type: 'urlData', data: localStorage.getItem('exampleKey') });
}



chrome.tabs.onActivated.addListener(function (activeInfo) {
    chrome.tabs.get(activeInfo.tabId, function (tab) {
        var currentTime = new Date().toLocaleTimeString();
        console.log(`[${currentTime}] Activated tab:`, tab.url);

        callExpressBackend(tab);
    });
});

/** ON UPDATE PAGE */
chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
    if (tab.active && change.url) {
        var currentTime = new Date().toLocaleTimeString();
        console.log(`[${currentTime}] Updated tab:`, change.url);

        callExpressBackend(tab);
    }
});

/** CREATE PAGE */
chrome.tabs.onCreated.addListener(function (tab) {
    var currentTime = new Date().toLocaleTimeString();
    console.log(`[${currentTime}] Tab created:`, tab.url);

    // Call backend function to send created URL
    callExpressBackend(tab);
});

/** ON CLOSE PAGE */
chrome.tabs.onRemoved.addListener(function (tabId, removeInfo) {
    fetch('http://localhost:8080/quit_url', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: 'url=' + encodeURIComponent(tabToUrl[tabId])
    }).then(response => {
        if (response.ok) {
            console.log('URL sent successfully.');
        } else {
            console.error('Failed to send URL.');
            console.error('Failed to send URL:', response.status, response.statusText);
        }
    }).catch(error => { // Catch any network errors
        console.error('Error:', error);
    });

    var currentTime = new Date().toLocaleTimeString();
    console.log(`[${currentTime}] Removed tab:`, tabToUrl[tabId]);

    delete tabToUrl[tabId];
});
