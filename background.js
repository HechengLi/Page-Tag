// only use for this script currently is to send url to content script on request
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse){
    var url = "error";
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var tab = tabs[0]; // current tab
        url = tab.url; // url of current tab
        sendResponse({url:url}); // send url back
    });
    return true;
});