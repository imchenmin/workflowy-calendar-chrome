chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getWorkflowyData') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'extractDates' }, (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          sendResponse({ success: false, error: chrome.runtime.lastError });
        } else {
          sendResponse({ success: true, data: response });
        }
      });
    });
    return true; // Keep the message channel open for sendResponse
  } else if (request.action === 'sendDates') {
    console.log('Received dates from content script:', request.dates);
    // Handle dates as needed, e.g., send to popup.js or save to storage
    chrome.storage.local.set({ workflowyDates: request.dates }, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
        sendResponse({ success: false, error: chrome.runtime.lastError });
      } else {
        sendResponse({ success: true });
      }
    });
    return true; // Keep the message channel open for sendResponse
  }
});
