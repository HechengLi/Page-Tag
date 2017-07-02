document.addEventListener('DOMContentLoaded', function() {
    var addBtn = document.getElementById('addMark');
    addBtn.addEventListener('click', function() { // signal a add mark call to content script
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            var markid = document.getElementById("markId").value;
            if (markid.length > 0) { // name of mark must be at least 1 character long
                chrome.tabs.sendMessage(tabs[0].id, {request: "add", id: document.getElementById("markId").value}, function(response) {
                    console.log(response.farewell);
                });
                window.close();
            }
        });
    }, false);
}, false);