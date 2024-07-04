document.addEventListener('DOMContentLoaded', function() {
  initializePopup();
  
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'refreshPopup') {
      initializePopup();
    }
  });
});

function initializePopup() {
  // 初始化显示空的日历
  displayCalendar({});

  // 获取当前活动标签页并发送消息请求数据
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs.length > 0) {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'getWorkflowyData' }, function(response) {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
        } else {
          console.log("Data request sent to content script.");
        }
      });
    }
  });
}

function displayCalendar(dates) {
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();
  const currentDay = currentDate.getDate();

  function generateCalendar(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = 32 - new Date(year, month, 32).getDate();
    let date = 1;
    let calendarHTML = '';

    for (let i = 0; i < 6; i++) {
      let row = '<tr>';
      for (let j = 0; j < 7; j++) {
        if (i === 0 && j < firstDay || date > daysInMonth) {
          row += '<td></td>';
        } else {
          const isToday = year === currentYear && month === currentMonth && date === currentDay;
          const className = isToday ? 'class="today"' : '';
          row += `<td ${className}>${date}<ul class="events" id="events-${year}-${month + 1}-${date}"></ul></td>`;
          date++;
        }
      }
      row += '</tr>';
      calendarHTML += row;
    }

    document.querySelector('#calendar tbody').innerHTML = calendarHTML;
  }

  generateCalendar(currentYear, currentMonth);

  // 如果有事件数据，则显示
  if (dates) {
    for (const [date, items] of Object.entries(dates)) {
      const [year, month, day] = date.split('-');
      const eventList = document.getElementById(`events-${year}-${parseInt(month, 10)}-${parseInt(day, 10)}`);
      if (eventList) {
        items.forEach(event => {
          const eventElement = document.createElement('li');
          const eventLink = document.createElement('a');
          eventLink.href = event.url;
          eventLink.innerHTML = event.name;
          eventLink.className = 'event-link';
          eventElement.appendChild(eventLink);
          eventList.appendChild(eventElement);
        });
      }
    }
  }

  // 为所有事件链接添加点击事件监听器
  setTimeout(() => {
    document.querySelectorAll('.event-link').forEach(link => {
      link.addEventListener('click', function(event) {
        event.preventDefault(); // 阻止默认行为
        const url = this.href;
        // 获取当前活动标签页并更新其URL
        chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
          if (tabs.length > 0) {
            chrome.tabs.update(tabs[0].id, { url: url });
          }
        });
      });
    });
  }, 100);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'workflowyData') {
    const calendarData = request.data;
    displayCalendar(calendarData);
    sendResponse({ success: true });
  }
});
