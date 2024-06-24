// chrome-extension-backend.js

/** ON ENTER */
function callExpressBackend(tab) {
    const mapsUrlPattern = /^https:\/\/www\.google\.com\/maps\/place\/.+\/@.+,.+,.+z\/data=!4m8!3m7!1s[^!]+!8m2!3d[^!]+!4d[^!]+!9m1!1b1!16s.+\?entry=ttu$/;
    
    if (mapsUrlPattern.test(tab.url)) {
        fetch('http://localhost:8080/send_url', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'url=' + encodeURIComponent(tab.url)
        }).then(response => {
            if (response.ok) {
                console.log('URL sent successfully.');
            } else {
                console.error('Failed to send URL:', response.status, response.statusText);
            }
        }).catch(error => { // Catch any network errors
            console.error('Error:', error);
        });
    } else {
        console.log('URL does not match the pattern. Skipping.');
    }
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
