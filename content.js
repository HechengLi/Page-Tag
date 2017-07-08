var markHeight = 20; // height of individual marks
var marks = []; // array of all marks
var topOffset = 0; // offset from 1st mark to top of webpage, unused
var peek = true; // peek on hover or not
var beforePeekPosition = -1; // remember position before peeking

// structure of a pagemark
function PageMark(id, mark) {
    this.id = id;
    this.mark = mark;
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
function addMark(id, mark) {
    var newMark = new PageMark(id, mark); // initialize new mark
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
        goToMark(newMark.mark);
        beforePeekPosition = -2;
        document.body.scrollTop = document.body.scrollTop+1;
    });
    gobtn.addEventListener('mouseover', function () {
        if (peek) {
            beforePeekPosition = document.body.scrollTop;
            goToMark(newMark.mark);
        }
    });
    gobtn.addEventListener('mouseout', function () {
        if (peek) {
            if (beforePeekPosition != -2) {
                goToMark(beforePeekPosition);
            }
            beforePeekPosition = -1;
        }
    })
    
    // container for delete and go buttons
    markdiv.id = newMark.id;
    markdiv.classList.add('markBody'); // load css
    var pos = mark - document.body.scrollTop; // calculate fixed position
    markdiv.style.top = pos.toString() + 'px';
    var markImgUrl = chrome.extension.getURL('icon/Mark.png'); // add background image
    markdiv.style.backgroundImage = 'url(' + markImgUrl + ')';
    markdiv.onmouseover = function() {deletebtn.style.display = 'block'; markdiv.style.width = '95px';} // show delete button
    markdiv.onmouseout = function() {deletebtn.style.display = 'none'; markdiv.style.width = '78px';} // hide delete button
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
        addMark(id, document.body.scrollTop + parseInt(hbar.style.top)); // proceed to add mark at clicked position
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
                addMark(m[i].id, m[i].mark); // add all marks
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