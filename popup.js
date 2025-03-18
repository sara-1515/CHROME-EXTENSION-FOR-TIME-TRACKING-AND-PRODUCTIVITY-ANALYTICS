// popup.js - Popup functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load today's data
    updateStats();
    
    // Add event listeners
    document.getElementById('dashboard-btn').addEventListener('click', openDashboard);
    document.getElementById('settings-btn').addEventListener('click', openSettings);
  });
  
  function updateStats() {
    const today = new Date().toISOString().split('T')[0];
    
    chrome.storage.local.get(['timeData', 'categories'], (result) => {
      const timeData = result.timeData || {};
      const categories = result.categories || {
        productive: [],
        unproductive: []
      };
      
      const todayData = timeData[today] || {};
      
      // Calculate totals
      let productive = 0;
      let unproductive = 0;
      let neutral = 0;
      let total = 0;
      let sitesList = [];
      
      Object.entries(todayData).forEach(([site, time]) => {
        total += time;
        
        // Categorize time
        let category = 'neutral';
        if (categories.productive.some(domain => site.includes(domain))) {
          category = 'productive';
          productive += time;
        } else if (categories.unproductive.some(domain => site.includes(domain))) {
          category = 'unproductive';
          unproductive += time;
        } else {
          neutral += time;
        }
        
        // Add to sites list
        sitesList.push({
          site,
          time,
          category
        });
      });
      
      // Update stats display
      document.getElementById('productive-time').textContent = formatTime(productive);
      document.getElementById('unproductive-time').textContent = formatTime(unproductive);
      document.getElementById('total-time').textContent = formatTime(total);
      
      // Update progress bar
      if (total > 0) {
        document.getElementById('productive-bar').style.width = `${(productive / total) * 100}%`;
        document.getElementById('neutral-bar').style.width = `${(neutral / total) * 100}%`;
        document.getElementById('unproductive-bar').style.width = `${(unproductive / total) * 100}%`;
      } else {
        document.getElementById('productive-bar').style.width = '0%';
        document.getElementById('neutral-bar').style.width = '0%';
        document.getElementById('unproductive-bar').style.width = '0%';
      }
      
      // Update top sites list
      updateTopSites(sitesList, categories);
    });
  }
  
  function updateTopSites(sitesList, categories) {
    const sitesListElement = document.getElementById('sites-list');
    sitesListElement.innerHTML = '';
    
    // Sort sites by time and take top 5
    sitesList.sort((a, b) => b.time - a.time);
    const topSites = sitesList.slice(0, 5);
    
    if (topSites.length === 0) {
      sitesListElement.innerHTML = '<li class="site-item">No data yet</li>';
      return;
    }
    
    topSites.forEach(siteData => {
      const listItem = document.createElement('li');
      listItem.className = 'site-item';
      
      // Format name (remove www., truncate if needed)
      let displayName = siteData.site.replace('www.', '');
      if (displayName.length > 20) {
        displayName = displayName.substring(0, 18) + '...';
      }
      
      // Create category tag
      const categoryTag = document.createElement('span');
      categoryTag.className = `category-tag tag-${siteData.category}`;
      categoryTag.textContent = siteData.category;
      
      listItem.innerHTML = `
        <div class="site-name">
          <img class="site-icon" src="https://www.google.com/s2/favicons?domain=${siteData.site}" alt="" />
          ${displayName}
        </div>
        <div class="site-time">${formatTime(siteData.time)}</div>
      `;
      
      // Insert category tag after site name
      const siteNameDiv = listItem.querySelector('.site-name');
      siteNameDiv.appendChild(categoryTag);
      
      sitesListElement.appendChild(listItem);
    });
  }
  
  function formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return `${seconds}s`;
    }
  }
  
  function openDashboard() {
    chrome.tabs.create({ url: 'dashboard.html' });
  }
  
  function openSettings() {
    chrome.tabs.create({ url: 'settings.html' });
  }