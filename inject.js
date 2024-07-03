  (function () {
    function dateExtractorEnhanced() {
      function extractDates(item, datesAccumulator) {
        const dateRegex = /<time.*?startYear="(\d+)"(?: endYear="(\d+)"|)(?: startMonth="(\d+)"|)(?: endMonth="(\d+)"|)(?: startDay="(\d+)"|)(?: endDay="(\d+)"|)(?: startHour="(\d+)"|)(?: startMinute="(\d+)"|)>.*?<\/time>/g;
        const note = item.getName();
        let match;

        while ((match = dateRegex.exec(note)) !== null) {
          const startYear = parseInt(match[1], 10);
          const endYear = parseInt(match[2], 10) || startYear;
          const startMonth = parseInt(match[3], 10) - 1 || 0;
          const endMonth = parseInt(match[4], 10) - 1 || startMonth;
          const startDay = parseInt(match[5], 10) || 1;
          const endDay = parseInt(match[6], 10) || startDay;
          const startHour = parseInt(match[7], 10) || 0;
          const startMinute = parseInt(match[8], 10) || 0;

          const startDate = new Date(Date.UTC(startYear, startMonth, startDay, startHour, startMinute));
          const endDate = new Date(Date.UTC(endYear, endMonth, endDay));

          let currentDate = new Date(startDate);

          while (currentDate <= endDate) {
            const currentDateKey = currentDate.toISOString().split('T')[0];

            if (!datesAccumulator[currentDateKey]) {
              datesAccumulator[currentDateKey] = [];
            }
            const targetItem = {"name": item.getName(), "note": item.getNote(), "url": "https://workflowy.com" + item.getUrl()}
            datesAccumulator[currentDateKey].push(targetItem);

            currentDate.setDate(currentDate.getDate() + 1);
          }
        }
      }

      function applyToEachItemAndExtractDates(parent, datesAccumulator) {
        extractDates(parent, datesAccumulator);
        for (let child of parent.getChildren()) {
          applyToEachItemAndExtractDates(child, datesAccumulator);
        }
      }

      const current = WF.currentItem();
      const dates = {};

      applyToEachItemAndExtractDates(current, dates);

      return dates;
    }

    function init() {
      console.log("init")
      // Extract dates and send to content script
      if (window.location.hostname === 'workflowy.com') {
        const dates = dateExtractorEnhanced();
        // Listen for messages from content.js
        window.addEventListener('message', function (event) {
          console.log("inject2")
          if (event.source !== window || !event.data.type || event.data.type !== 'GET_WORKFLOWY_DATA') {
            return;
          }
          console.log("inject")
          console.log(dates)

          // Send data back to content.js
          window.postMessage({ type: 'WORKFLOWY_DATA', data: dates }, '*');
        });
      }
    }
    // 等待 DOM 完全加载后再执行 init 函数
    if (document.readyState === 'complete') {
      init();
    } else {
      // TODO 判断是否加载了 WF.currentItem();
      setTimeout(init, 3000);
      // document.addEventListener('DOMContentLoaded', init);
    }
  })();
