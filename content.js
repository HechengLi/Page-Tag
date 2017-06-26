var markHeight = 20;
var marks = [];
var topOffset = 0;  

function PageMark(id, mark) {
    this.id = id;
    this.mark = mark;
    this.div;
}

function goToMark(num) {
    document.body.scrollTop = num;
}

function removeMark(id, mark) {
    for (var i = 0; i < marks.length; i++) {
        if ((marks[i].id == id)&&(marks[i].mark == mark)) {
            marks[i].div.parentNode.removeChild(marks[i].div);
            marks.splice(i, 1);
        }
    }
    saveMarks();
}

function addMark(id, mark) {
    var newMark = new PageMark(id, mark);
    marks.push(newMark);
    marks = quicksort(marks, 0, marks.length-1);
    var markdiv = document.createElement('div');
    var gobtn = document.createElement('a');
    var deletebtn = document.createElement('a');
    
    deletebtn.innerHTML = 'x';
    deletebtn.classList.add('deleteBtn');
    deletebtn.addEventListener('click', function () {
        removeMark(id, mark);
    });
    
    gobtn.innerHTML = newMark.id;
    gobtn.classList.add('markBtn');
    gobtn.addEventListener('click', function () {
        goToMark(newMark.mark);
    });
    markdiv.id = newMark.id;
    markdiv.classList.add('markBody');
    var pos = mark - document.body.scrollTop;
    markdiv.style.top = pos.toString() + 'px';
    var markImgUrl = chrome.extension.getURL('Mark.png');
    markdiv.style.backgroundImage = 'url(' + markImgUrl + ')';
    markdiv.onmouseover = function() {deletebtn.style.display = 'block'; markdiv.style.width = '95px';}
    markdiv.onmouseout = function() {deletebtn.style.display = 'none'; markdiv.style.width = '78px';}
    markdiv.appendChild(deletebtn);
    markdiv.appendChild(gobtn);
    
    newMark.div = markdiv;
    document.body.appendChild(markdiv);
    
    saveMarks();
}

function addSelector(id) {
    var hbar = document.createElement('div');
    hbar.id = 'horizontal-selector';
    hbar.classList.add('hrLine');
    hbar.addEventListener('click', function () {
        addMark(id, document.body.scrollTop + parseInt(hbar.style.top));
        hbar.parentNode.removeChild(hbar);
    });
    document.body.appendChild(hbar);
}

var drawLines = function (event) {
    var y = event.pageY;
    document.getElementById('horizontal-selector').style.top = (y - document.body.scrollTop).toString() + "px";
}

document.body.addEventListener('mousemove', function (event) {
    drawLines(event);
});

window.onscroll = function () {
    for (var i = 0; i < marks.length; i++) {
        var markDiv = document.getElementById(marks[i].id);
        var markPos = marks[i].mark;
        var pos = markPos - document.body.scrollTop;
        if (pos < topOffset + markHeight * i) pos = topOffset + markHeight * i;
        if (markPos > (document.body.scrollTop + window.innerHeight - markHeight * (marks.length - i))) pos = window.innerHeight - markHeight * (marks.length - i);
        markDiv.style.top = pos.toString() + "px";
    }
}

chrome.runtime.onMessage.addListener(
    function (request, sender, callback) {
        if (request.request == "add") {
            if (document.getElementById('horizontal-selector')) {
                document.getElementById('horizontal-selector').parentNode.removeChild(document.getElementById('horizontal-selector'));
            }
            addSelector(request.id);
        } else if (request.request == "save") {
            saveMarks();
            alert("saved");
        } else if (request.request == "load") {
            var urlid = String(request.url);
            urlid = urlid.replace(/[^a-zA-Z]/g, "");
            chrome.storage.sync.get(urlid, function(item) {
                var m = item[urlid];
                for (var i = 0; i < m.length; i++) {
                    addMark(m[i].id, m[i].mark);
                }
                for (var i = 0; i < marks.length; i++) {
                    var markDiv = document.getElementById(marks[i].id);
                    var markPos = marks[i].mark;
                    var pos = markPos - document.body.scrollTop;
                    if (pos < topOffset + markHeight * i) pos = topOffset + markHeight * i;
                    if (markPos > (document.body.scrollTop + window.innerHeight - markHeight * (marks.length - i))) pos = window.innerHeight - markHeight * (marks.length - i);
                    markDiv.style.top = pos.toString() + "px";
                }
            });
        }
    }
);

function quicksort(A, low, high) {
    var len = A.length;
    var pivot;
    var partitionIndex;
    if (low < high) {
        pivot = high;
        partitionIndex = partition(A, pivot, low, high);
        quicksort(A, low, partitionIndex - 1);
        quicksort(A, partitionIndex + 1, high);
    }
    return A;
}

function partition(A, pivot, low, high) {
    var pivotValue = A[pivot].mark;
    var partitionIndex = low;
    for (var i = low; i < high; i++) {
        if (A[i].mark < pivotValue) {
            swap(A, i, partitionIndex);
            partitionIndex++;
        }
    }
    swap(A, high, partitionIndex);
    return partitionIndex;
}

function swap(A, i, j) {
    var temp = A[i];
    A[i] = A[j];
    A[j] = temp;
}

function saveMarks() {
    chrome.runtime.sendMessage({request: "url"}, function(response) {
        var urlid = String(response.url);
        urlid = urlid.replace(/[^a-zA-Z]/g, "");
        var data = JSON.stringify(marks);
        var json = JSON.parse('{ \"' + urlid + '\":' + data + '}');
        chrome.storage.sync.set(json, function() {
            //alert();
        });
    });
}