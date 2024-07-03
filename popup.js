document.addEventListener('DOMContentLoaded', function() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    chrome.tabs.sendMessage(tabs[0].id, { action: 'getWorkflowyData' }, function(response) {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        console.log("Data request sent to content script.");
      }
    });
  });
});

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
  for (const [date, items] of Object.entries(dates)) {
    const [year, month, day] = date.split('-');
    const eventList = document.getElementById(`events-${year}-${parseInt(month, 10)}-${parseInt(day, 10)}`);
    if (eventList) {
      items.forEach(event => {
        const eventElement = document.createElement('li');
        const eventLink = document.createElement('a');
        eventLink.href = event.url;
        eventLink.target = '_blank';
        eventLink.innerHTML = event.name;
        eventElement.appendChild(eventLink);
        eventList.appendChild(eventElement);
      });
    }
  }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  debugger;
  if (request.action === 'workflowyData') {
    const calendarData = request.data;
    displayCalendar(calendarData);
    sendResponse({ success: true });
  }
});
