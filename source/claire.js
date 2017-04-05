// Claire
/* global define */
define(['./request'], function (Request) {
  'use strict';

  // a mapping of tab IDs to window.requests
  window.requests = {};

  // listen to all web requests and when request is completed, create a new
  // Request object that contains a bunch of information about the request
  var processCompletedRequest = function (details) {
    var request = new Request(details);
    window.requests[details.tabId] = request;
    request.logToConsole();
  };

  var filter = {
    urls: ['<all_urls>'],
    types: ['main_frame']
  };

  var extraInfoSpec = ['responseHeaders'];

  // start listening to all web window.requests
  chrome.webRequest.onCompleted.addListener(processCompletedRequest, filter, extraInfoSpec);

  // when a tab is replaced, usually when a request started in a background tab
  // and then the tab is upgraded to a regular tab (becomes visible)
  chrome.tabs.onReplaced.addListener(function (addedTabId, removedTabId) {
    if (removedTabId in window.requests) {
      window.requests[addedTabId] = window.requests[removedTabId];
      delete window.requests[removedTabId];
    } else {
      console.log('Could not find an entry in window.requests when replacing ', removedTabId);
    }
  });

  chrome.webNavigation.onDOMContentLoaded.addListener(function (details) {
    if (details.frameId > 0) {
      // we don't care about sub-frame window.requests
      return;
    }

    if (details.tabId in window.requests) {
      var request = window.requests[details.tabId];
      if (!request.details.fromCache) {
        request.queryConnectionInfoAndSetIcon();
      }
    }
  });

  chrome.runtime.onMessage.addListener(function (csRequest, sender, sendResponse) {
    var request = window.requests[sender.tab.id];
    if (request) {
      request.setConnectionInfo(csRequest);
    }
    sendResponse({});
  });

  // clear request data when tabs are destroyed
  chrome.tabs.onRemoved.addListener(function (tabId) {
    delete window.requests[tabId];
  });
});

