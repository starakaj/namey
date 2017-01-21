// Copyright (c) 2011 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

// The background page is asking us to find an address on the page.
if (window == top) {
  chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
    searchNames();
  });
}

// thanks http://stackoverflow.com/questions/9838812/how-can-i-open-a-json-file-in-javascript-without-jquery
function loadJSON(path, success, error)
{
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function()
    {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                if (success)
                    success(JSON.parse(xhr.responseText));
            } else {
                if (error)
                    error(xhr);
            }
        }
    };
    xhr.open("GET", path, true);
    xhr.send();
}

var nameSearchSuccess = function(data) {
  scanDOMNodeForNames(document.body, data.names);
}

var nameSearchError = function(error) {
  // Log the error
}

var searchNames = function() {
  var namesURL = chrome.extension.getURL("names.json");
  loadJSON(namesURL, nameSearchSuccess, nameSearchError);
}

function scanDOMNodeForNames(node, names) {
    var next;
    if (node.nodeType === 1) {
        // (Element node)
        if (node = node.firstChild) {
            do {
                // Recursively call traverseChildNodes
                // on each child node
                next = node.nextSibling;
                scanDOMNodeForNames(node, names);
            } while(node = next);
        }
    } else if (node.nodeType === 3) {
        // (Text node)
        for (var n = 0; n<names.length; n++) {
          var name = names[n];
          var nameIdx = node.textContent.indexOf(name);
          if (nameIdx >= 0) {
            wrapMatchesInNode(node, name);
            break;
          }
        }
    }
}

function wrapMatchesInNode(textNode, match) {
    var temp = document.createElement('div');
    var regex = new RegExp(`${match}`, 'g');
    temp.innerHTML = textNode.data.replace(regex, '<a href="https://littlesis.org/search?q=$&">$&</a>');

    console.log("REPLACING");

    // temp.innerHTML is now:
    // "n    This order's reference number is <a href="/order/RF83297">RF83297</a>.n"
    // |_______________________________________|__________________________________|___|
    //                     |                                      |                 |
    //                 TEXT NODE                             ELEMENT NODE       TEXT NODE

    // Extract produced nodes and insert them
    // before original textNode:
    while (temp.firstChild) {
        // console.log(temp.firstChild.nodeType);
        textNode.parentNode.appendChild(temp.firstChild);
    }
    // Logged: 3,1,3

    // Remove original text-node:
    textNode.parentNode.removeChild(textNode);
}
