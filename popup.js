document.addEventListener('DOMContentLoaded', function() {
    var addBtn = document.getElementById('addMark');
    addBtn.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var markid = document.getElementById("markId").value;
            if (markid.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, {request: "add", id: document.getElementById("markId").value}, function(response) {
                    console.log(response.farewell);
                });
                window.close();
            }
        });
    }, false);
    
    var saveBtn = document.getElementById('save');
    saveBtn.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.getSelected(null, function(tab) {
                var tabid = tab.url;
                chrome.tabs.sendMessage(tabs[0].id, {request: "save", url: tabid}, function(response) {
                    console.log(response.farewell);
                });
            });
        });
    }, false);
    
    var loadBtn = document.getElementById('load');
    loadBtn.addEventListener('click', function() {
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.getSelected(null, function(tab) {
                var tabid = tab.url;
                chrome.tabs.sendMessage(tabs[0].id, {request: "load", url: tabid}, function(response) {
                    console.log(response.farewell);
                });
            });
        });
    }, false);
}, false);