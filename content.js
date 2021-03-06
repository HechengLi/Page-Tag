var markHeight = 20; // height of individual marks
var marks = []; // array of all marks
var topOffset = 0; // offset from 1st mark to top of webpage, unused
var peek = true; // peek on hover or not
var beforePeekPosition = -1; // remember position before peeking
var autoHide = true; // hide or not
var speed = 5; // expand&shrink speed
var minimizedSize = 20; // size of tag after shrinked
var instantScroll = false; // instant scroll or not
var slowInterval = null; // interval used for non instant scrolling
var absolutePosition = false;

// structure of a pagemark
function PageMark(id, mark) {
    this.id = id;
    this.mark = mark;
    this.absoluteMark = 0;
    this.div;
}

/*
// scroll to position
*/
function goToMark(num) {
    document.body.scrollTop = num;
}

/*
// remove a mark
*/
function removeMark(id, mark) {
    for (var i = 0; i < marks.length; i++) {
        if ((marks[i].id == id)&&(marks[i].mark == mark)) {
            marks[i].div.parentNode.removeChild(marks[i].div); // remove mark from webpage
            marks.splice(i, 1); // remove mark from marks array
        }
    }
    saveMarks(); // save
}

/*
// add a new mark
*/
function addMark(id, mark, y) {
    var newMark = new PageMark(id, mark); // initialize new mark
    newMark.absoluteMark = y;
    marks.push(newMark); // add to marks array
    marks = quicksort(marks, 0, marks.length-1); // sort the current marks array from low to high
    
    // create html elements
    var markdiv = document.createElement('div');
    var gobtn = document.createElement('button');
    var deletebtn = document.createElement('button');
    
    // delete button (hidden by default)
    deletebtn.innerHTML = 'x';
    deletebtn.classList.add('deleteBtn'); // load css
    deletebtn.addEventListener('click', function () {
        removeMark(id, mark);
        beforePeekPosition = -2;
    });
    
    // go button
    gobtn.innerHTML = newMark.id;
    gobtn.classList.add('markBtn'); // load css
    gobtn.addEventListener('click', function () {
        var target = newMark.mark;
        if (absolutePosition) {
            target = newMark.absoluteMark;
        }
        goToMark(target);
        beforePeekPosition = -2;
        document.body.scrollTop = document.body.scrollTop+1; // this is to trigger tags movement
        document.body.scrollTop = document.body.scrollTop-1;
    });
    
    if (!instantScroll) { // if instant scroll is off
        if (peek) { // if peek is enabled
            gobtn.addEventListener('mouseover', function () {
                if (beforePeekPosition < 0) { // this means it's not currently peeking or finished peaking
                    beforePeekPosition = document.body.scrollTop; // remember where peaking started
                    if (beforePeekPosition <= 0) { // if before peeking position is 0 it can cause unexpected bahaviour
                        beforePeekPosition = 1;
                    }
                }
                var target = newMark.mark;
                if (absolutePosition) {
                    target = newMark.absoluteMark;
                }
                var diff = (target - document.body.scrollTop)/50; // this is how much it will scroll every interval
                clearInterval(slowInterval); // stop current interval before starting new interval
                slowInterval = setInterval(slowFrame1, 3); // start a new interval
                function slowFrame1() { // this is the scrolling function
                    if (Math.abs(document.body.scrollTop - target) <= Math.abs(diff)) { // if its very close to destination
                        clearInterval(slowInterval); // stop scrolling
                        document.body.scrollTop = target; // set scroll to destination
                    } else {
                        document.body.scrollTop = document.body.scrollTop + diff; // scrolling
                    }
                }
            });
            gobtn.addEventListener('mouseout', function () {
                if (beforePeekPosition != -2) { // This means mouse left without clicking
                    var diff = (beforePeekPosition - document.body.scrollTop)/50; // this is how much it will scroll every interval
                    clearInterval(slowInterval); // stop current interval before starting new interval
                    slowInterval = setInterval(slowFrame2, 3); // start a new interval
                    function slowFrame2() { // this is the scrolling function
                        if (Math.abs(document.body.scrollTop - beforePeekPosition) <= Math.abs(diff)) { // if its very close to destination
                            clearInterval(slowInterval); // stop scrolling
                            document.body.scrollTop = beforePeekPosition; // set scroll to destination
                            beforePeekPosition = -1; // peek finished
                        } else {
                            document.body.scrollTop = document.body.scrollTop + diff; // scroll
                        }
                    }
                }
            });
        }
    } else {
        if (peek) {
            gobtn.addEventListener('mouseover', function () {
                beforePeekPosition = document.body.scrollTop;
                var target = newMark.mark;
                if (absolutePosition) {
                    target = newMark.absoluteMark;
                }
                goToMark(target);
            });
            gobtn.addEventListener('mouseout', function () {    
                if (beforePeekPosition != -2) {
                    goToMark(beforePeekPosition);
                }
                beforePeekPosition = -1;
            });
        }
    }
    // container for delete and go buttons
    markdiv.id = newMark.id;
    markdiv.classList.add('markBody'); // load css
    var pos = mark - document.body.scrollTop; // calculate fixed position
    markdiv.style.top = pos.toString() + 'px';
    var markImgUrl = chrome.extension.getURL('icon/Mark.png'); // add background image
    markdiv.style.backgroundImage = 'url(' + markImgUrl + ')';
    if (autoHide) { // autohide mode (tag will minimize)
        var interval1 = null; // interval for expand
        var interval2 = null; // interval for shrink
        markdiv.onmouseover = function() { // show delete button
            clearInterval(interval2); // clear shrink interval
            interval2 = null; // this is to avoid shrink and expand at the sametime
            var pos = parseInt(markdiv.style.width);
            if (interval1 == null) { // check if tag is already expanding
                interval1 = setInterval(frame1, speed); // start expanding
            }
            function frame1() { // expand function
                if (pos >= 78) { // expand until 78px, then add delete button
                    clearInterval(interval1); // clear expand interval upon finish
                    interval1 = null;
                    markdiv.style.width = '95px'; // make room for delete button
                    markdiv.style.backgroundPosition = "0px"; // fix background image position
                    deletebtn.style.display = 'block'; // add delete button
                } else {
                    pos++; // expand
                    markdiv.style.width = pos.toString() + 'px';
                }
            }
        }
        markdiv.onmouseout = function() { // hide delete button
            clearInterval(interval1); // clear expand interval
            interval1 = null; // this is to avoid shrink and expand at the sametime
            var pos = parseInt(markdiv.style.width);
            if (interval2 == null) { // check if interval is already shrinking
                interval2 = setInterval(frame2, speed); // start shrinking
            }
            function frame2() { // shrink function
                if (pos <= minimizedSize) { // shrink until minimum threshold
                    clearInterval(interval2); // clear shrink interval when minimum threshold reached
                    interval2 = null;
                } else {
                    pos--; // shrink
                    markdiv.style.width = pos.toString() + 'px';
                    if (pos == 94) { // sometimes when moving between buttons causes a shrink and unexpected behaviour, this fixes the problem 
                        markdiv.style.backgroundPosition = "-17px"; // fix background image position
                        deletebtn.style.display = 'none'; // hide delete button
                        pos = pos - 17; // shrink the size of a delete button
                        markdiv.style.width = pos.toString() + 'px';
                    }
                }
            }
        }
        markdiv.style.backgroundPosition = '-17px';
        markdiv.style.width = minimizedSize.toString() + 'px';
    } else {
        markdiv.onmouseover = function() { // show delete button
            markdiv.style.width = '95px';
            markdiv.style.backgroundPosition = "0px";
            deletebtn.style.display = 'block';
        }
        markdiv.onmouseout = function() { // hide delete button
            deletebtn.style.display = 'none'; 
            markdiv.style.width = '78px';
            markdiv.style.backgroundPosition = "-17px";
        }
    }
    markdiv.appendChild(deletebtn);
    markdiv.appendChild(gobtn);
    
    newMark.div = markdiv;
    document.body.appendChild(markdiv); // add to webpage
    
    saveMarks(); // save
}

/*
// Show selector (A selector helps user choose where to add a pagemark)
*/
function addSelector(id) {
    var hbar = document.createElement('div'); // create html element
    hbar.id = 'horizontal-selector';
    hbar.classList.add('hrLine'); // load css
    hbar.addEventListener('click', function () {
        addMark(id, document.body.scrollTop + parseInt(hbar.style.top), document.body.scrollTop); // proceed to add mark at clicked position
        hbar.parentNode.removeChild(hbar); // remove selector
    });
    document.body.appendChild(hbar); // add to webpage
}

// this part helps selector always follow mouse
var drawLines = function (event) {
    var y = event.pageY;    
    document.getElementById('horizontal-selector').style.top = (y - document.body.scrollTop).toString() + "px";
}

document.body.addEventListener('mousemove', function (event) {
    drawLines(event);
});

// show selector when user wants to add a mark
chrome.runtime.onMessage.addListener(
    function (request, sender, callback) {
        if (request.request == "add") {
            if (document.getElementById('horizontal-selector')) {
                document.getElementById('horizontal-selector').parentNode.removeChild(document.getElementById('horizontal-selector'));
            }
            addSelector(request.id);
        }
    }
);

/*
// quicksort algorithm
// note: insertion sort actually works better here since the array will be almost sorted
//       I'm only using quicksort for practice purpose
*/
function quicksort(A, low, high) {
    var len = A.length;
    var pivot;
    var partitionIndex;
    if (low < high) {
        pivot = high;
        partitionIndex = partition(A, pivot, low, high); // position of pivot after partition
        quicksort(A, low, partitionIndex - 1); // sort left
        quicksort(A, partitionIndex + 1, high); // sort right
    }
    return A;
}

/*
// partition step of quicksort
*/
function partition(A, pivot, low, high) {
    var pivotValue = A[pivot].mark;
    var partitionIndex = low;
    for (var i = low; i < high; i++) {
        if (A[i].mark < pivotValue) { // if a value lower than pivot is found
            swap(A, i, partitionIndex); // move value to left end
            partitionIndex++; // increase leftwall
        }
    }
    swap(A, high, partitionIndex); // swap wall and pivot
    return partitionIndex;
}

/*
// swaps value at two index of an array
*/
function swap(A, i, j) {
    var temp = A[i];
    A[i] = A[j];
    A[j] = temp;
}

/*
// save marks to chrome storage
*/
function saveMarks() {
    chrome.runtime.sendMessage({request: "url"}, function(response) { // call background script for url
        var urlid = String(response.url);
        urlid = urlid.replace(/[^a-zA-Z]/g, ""); // remove all characters except alphabets (dont want special chars to cause problem)
                                                 // there is a chance of duplicate url, but the possibility is very low
        var data = JSON.stringify(marks); // change marks array to string
        var json = JSON.parse('{ \"' + urlid + '\":' + data + '}'); // parse url and marks into JSON format
        chrome.storage.sync.set(json, function() { // save
            //alert();
        });
    });
}

/*
// load marks from chrome storage
*/
function loadMarks() {
    chrome.runtime.sendMessage({request: "url"}, function(response) { // call background script for url
        var urlid = String(response.url);
        urlid = urlid.replace(/[^a-zA-Z]/g, ""); // remove all characters except alphabets (because we did that when saving)
        chrome.storage.sync.get(urlid, function(item) {
            var m = item[urlid]; // get back marks array
            for (var i = 0; i < m.length; i++) {
                addMark(m[i].id, m[i].mark, m[i].absoluteMark); // add all marks
            }
            for (var i = 0; i < marks.length; i++) { // put all marks into correct position
                var markDiv = document.getElementById(marks[i].id); // get html element
                var markPos = marks[i].mark;
                var pos = markPos - document.body.scrollTop; // calculate correct fixed position
                if (pos < topOffset + markHeight * i) pos = topOffset + markHeight * i; // if position is higher than top of webpage
                if (markPos > (document.body.scrollTop + window.innerHeight - markHeight * (marks.length - i))) pos = window.innerHeight - markHeight * (marks.length - i); // if position is lower than bottom of webpage
                markDiv.style.top = pos.toString() + "px"; // move mark
            }
        });
    });
}

/*
// load options
*/
function loadOptions() {
    chrome.storage.sync.get("peekbox", function(item) {
        peek = item["peekbox"];
    });
    chrome.storage.sync.get("hidebox", function(item) {
        autoHide = item["hidebox"];
    });
    chrome.storage.sync.get("scrollbox", function(item) {
        instantScroll = item["scrollbox"];
    });
    chrome.storage.sync.get("absolutebox", function(item) {
        absolutePosition = item["absolutebox"];
    });
}

// when scrolling through the webpage, change the positions of pagemarks
window.onscroll = function () {
    if (beforePeekPosition < 0) { // only run when not peeking to avoid infinite loop
        for (var i = 0; i < marks.length; i++) {
            var markDiv = document.getElementById(marks[i].id); // get html element
            var markPos = marks[i].mark;
            var pos = markPos - document.body.scrollTop; // calculate correct fixed position
            if (pos < topOffset + markHeight * i) pos = topOffset + markHeight * i; // if position is higher than top of webpage
            if (markPos > (document.body.scrollTop + window.innerHeight - markHeight * (marks.length - i))) pos = window.innerHeight - markHeight * (marks.length - i); // if position is lower than bottom of webpage
            markDiv.style.top = pos.toString() + "px"; // move mark
        }
    }
}

// load marks and option when user opens a webpage
loadMarks();
loadOptions();

// This part is for debugging only
var testWindow = document.createElement('div');
testWindow.style.position = 'fixed';
testWindow.innerHTML = '0';
testWindow.style.left = '0%';
testWindow.style.height = '30px';
testWindow.style.width = '30px';
testWindow.style.top = '50%';
testWindow.style.backgroundColor = 'white';
document.body.appendChild(testWindow);
