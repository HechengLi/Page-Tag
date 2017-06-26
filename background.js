
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse){
    var url = "error";
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var tab = tabs[0];
        url = tab.url;
        sendResponse({url:url});
    });
    return true;
});