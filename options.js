// Saves options to chrome.storage.sync.
function save_options() {
    var peekbox = document.getElementById('peek').checked;
        chrome.storage.sync.set({
        peekbox: peekbox
    }, function() {
        // Update status to let user know options were saved.
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function() {
            status.textContent = '';
        }, 750);
    });
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
    chrome.storage.sync.get({
        peekbox: true
    }, function(items) {
        document.getElementById('peek').checked = items.peekbox;
    });
}
document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);