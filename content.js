function injectScript(filePath, tag) {
  const script = document.createElement('script');
  script.setAttribute('type', 'text/javascript');
  script.setAttribute('src', filePath);
  document.getElementsByTagName(tag)[0].appendChild(script);
}

injectScript(chrome.runtime.getURL('inject.js'), 'body');

function requestWorkflowyData() {
  window.postMessage({ type: 'GET_WORKFLOWY_DATA' }, '*');
}

window.addEventListener('message', function(event) {
  if (event.source !== window || !event.data.type || event.data.type !== 'WORKFLOWY_DATA' || !event.data.data) {
    return;
  }
  const data = event.data.data;
  chrome.runtime.sendMessage({ action: 'workflowyData', data: data });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getWorkflowyData') {
    requestWorkflowyData();
    sendResponse({ success: true });
  }
});
