function getRelevantDates(timeRange) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dates = {
      start: new Date(today),
      end: new Date(today),
      dateArray: []
    };
    
    switch(timeRange) {
      case 'today':
        // Start and end are already set to today
        dates.dateArray.push(today.toISOString().split('T')[0]);
        break;
      case 'yesterday':
        dates.start.setDate(today.getDate() - 1);
        dates.end.setDate(today.getDate() - 1);
        dates.dateArray.push(dates.start.toISOString().split('T')[0]);
        break;
      case 'last7':
        dates.start.setDate(today.getDate() - 6);
        // Create array of last 7 days
        for (let i = 0; i < 7; i++) {
          const date = new Date(dates.start);
          date.setDate(date.getDate() + i);
          dates.dateArray.push(date.toISOString().split('T')[0]);
        }
        break;
      case 'last30':
        dates.start.setDate(today.getDate() - 29);
        // Create array of last 30 days
        for (let i = 0; i < 30; i++) {
          const date = new Date(dates.start);
          date.setDate(date.getDate() + i);
          dates.dateArray.push(date.toISOString().split('T')[0]);
        }
        break;
    }
    
    return dates;
  }
  
  function processTimeData(timeData, categories, dates) {
    const processedData = {
      totalTime: 0,
      productiveTime: 0,
      unproductiveTime: 0,
      neutralTime: 0,
      dailyData: {},
      siteData: {}
    };
    
    // Process each date in the range
    dates.dateArray.forEach(dateStr => {
      const dailyData = timeData[dateStr] || {};
      
      // Initialize daily data structure
      processedData.dailyData[dateStr] = {
        total: 0,
        productive: 0,
        unproductive: 0,
        neutral: 0
      };
      
      // Process each site's data
      Object.entries(dailyData).forEach(([site, time]) => {
        // Increment total time
        processedData.totalTime += time;
        processedData.dailyData[dateStr].total += time;
        
        // Categorize time
        let category = 'neutral';
        if (categories.productive.some(domain => site.includes(domain))) {
          category = 'productive';
          processedData.productiveTime += time;
          processedData.dailyData[dateStr].productive += time;
        } else if (categories.unproductive.some(domain => site.includes(domain))) {
          category = 'unproductive';
          processedData.unproductiveTime += time;
          processedData.dailyData[dateStr].unproductive += time;
        } else {
          processedData.neutralTime += time;
          processedData.dailyData[dateStr].neutral += time;
        }
        
        // Add to site data
        if (!processedData.siteData[site]) {
          processedData.siteData[site] = {
            time: 0,
            category: category
          };
        }
        processedData.siteData[site].time += time;
      });
    });
    
    // Calculate productivity score
    if (processedData.totalTime > 0) {
      processedData.productivityScore = Math.round((processedData.productiveTime / processedData.totalTime) * 100);
    } else {
      processedData.productivityScore = 0;
    }
    
    return processedData;
  }
  
  function updateMetricsOverview(data) {
    // Update total time
    document.getElementById('total-time-value').textContent = formatTime(data.totalTime);
    
    // Update productivity score
    document.getElementById('productivity-score').textContent = data.productivityScore;
    
    // Update time breakdown
    document.getElementById('productive-value').textContent = formatTime(data.productiveTime);
    document.getElementById('neutral-value').textContent = formatTime(data.neutralTime);
    document.getElementById('unproductive-value').textContent = formatTime(data.unproductiveTime);
  }
  
  function formatTime(milliseconds) {
    if (milliseconds === 0) return '0m';
    
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else {
      return `${minutes}m`;
    }
  }
  
  function initDailyChart() {
    const ctx = document.getElementById('daily-chart').getContext('2d');
    return new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            label: 'Productive',
            backgroundColor: '#0F9D58',
            data: []
          },
          {
            label: 'Neutral',
            backgroundColor: '#4285F4',
            data: []
          },
          {
            label: 'Unproductive',
            backgroundColor: '#DB4437',
            data: []
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            stacked: true
          },
          y: {
            stacked: true,
            ticks: {
              callback: function(value) {
                return value + 'm';
              }
            }
          }
        }
      }
    });
  }
  
  function initCategoryChart() {
    const ctx = document.getElementById('category-chart').getContext('2d');
    return new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Productive', 'Neutral', 'Unproductive'],
        datasets: [{
          data: [0, 0, 0],
          backgroundColor: ['#0F9D58', '#4285F4', '#DB4437']
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                const value = context.raw;
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                return `${formatTime(value)} (${percentage}%)`;
              }
            }
          }
        }
      }
    });
  }
  
  function updateDailyChart(chart, data, dates) {
    // Format date labels
    const labels = dates.dateArray.map(dateStr => {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    });
    
    // Prepare data for chart
    const productiveData = [];
    const neutralData = [];
    const unproductiveData = [];
    
    dates.dateArray.forEach(dateStr => {
      const dayData = data.dailyData[dateStr] || { productive: 0, neutral: 0, unproductive: 0 };
      productiveData.push(Math.round(dayData.productive / 60000)); // Convert to minutes
      neutralData.push(Math.round(dayData.neutral / 60000));
      unproductiveData.push(Math.round(dayData.unproductive / 60000));
    });
    
    // Update chart data
    chart.data.labels = labels;
    chart.data.datasets[0].data = productiveData;
    chart.data.datasets[1].data = neutralData;
    chart.data.datasets[2].data = unproductiveData;
    
    chart.update();
  }
  
  function updateCategoryChart(chart, data) {
    chart.data.datasets[0].data = [
      data.productiveTime,
      data.neutralTime,
      data.unproductiveTime
    ];
    
    chart.update();
  }
  
  function updateTopSites(siteData) {
    const container = document.getElementById('top-sites-container');
    container.innerHTML = '';
    
    // Sort sites by time spent
    const sortedSites = Object.entries(siteData)
      .sort((a, b) => b[1].time - a[1].time)
      .slice(0, 10); // Top 10 sites
    
    // Calculate total time for percentages
    const totalTime = sortedSites.reduce((total, [_, data]) => total + data.time, 0);
    
    // Create site cards
    sortedSites.forEach(([site, data]) => {
      const percentage = totalTime > 0 ? Math.round((data.time / totalTime) * 100) : 0;
      
      const card = document.createElement('div');
      card.className = 'site-card';
      
      const categoryClass = `category-${data.category}`;
      
      card.innerHTML = `
        <div class="site-info">
          <div class="site-name">
            <img class="favicon" src="https://www.google.com/s2/favicons?domain=${site}" alt="" />
            ${site.replace('www.', '')}
            <span class="site-category ${categoryClass}">${data.category}</span>
          </div>
          <div class="site-time">${formatTime(data.time)}</div>
        </div>
        <div class="site-percentage">${percentage}%</div>
      `;
      
      container.appendChild(card);
    });
    
    // Show message if no data
    if (sortedSites.length === 0) {
      container.innerHTML = '<p>No data available for the selected time period.</p>';
    }
  }
  
  function loadWeeklyReports() {
    chrome.storage.local.get(['weeklyReports'], function(result) {
      const reports = result.weeklyReports || [];
      const container = document.getElementById('weekly-reports-container');
      
      if (reports.length === 0) {
        container.innerHTML = '<p>No weekly reports available yet.</p>';
        return;
      }
      
      // Create report cards
      reports.forEach(report => {
        const card = document.createElement('div');
        card.className = 'report-card';
        
        card.innerHTML = `
          <div class="report-header">
            <div class="report-date">${report.startDate} to ${report.endDate}</div>
            <div class="report-score">${report.productivityScore}</div>
          </div>
          <div class="report-details">
            <div class="report-stats">
              <div class="report-stats-item">
                <span>Total Time:</span>
                <span>${formatTime(report.totalTime)}</span>
              </div>
              <div class="report-stats-item">
                <span>Productive Time:</span>
                <span>${formatTime(report.productive)}</span>
              </div>
              <div class="report-stats-item">
                <span>Unproductive Time:</span>
                <span>${formatTime(report.unproductive)}</span>
              </div>
            </div>
          </div>
        `;
        
        container.appendChild(card);
      });
    });
  }