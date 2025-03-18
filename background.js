// background.js - Core tracking functionality
let startTime;
let currentUrl;
let currentTabId;
let activeTimeData = {};
let siteCategories = {
  productive: [
    "github.com",
    "stackoverflow.com",
    "gitlab.com",
    "docs.google.com",
    "trello.com",
    "notion.so",
    "overleaf.com",
    "kaggle.com"
  ],
  unproductive: [
    "facebook.com",
    "instagram.com",
    "twitter.com",
    "reddit.com",
    "youtube.com",
    "netflix.com",
    "tiktok.com"
  ]
};

// Initialize data structure
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get(['timeData', 'categories'], (result) => {
    if (!result.timeData) {
      chrome.storage.local.set({ timeData: {} });
    }
    if (!result.categories) {
      chrome.storage.local.set({ categories: siteCategories });
    }
  });
  
  // Create daily alarm for data processing
  chrome.alarms.create('dailyReset', { periodInMinutes: 1440 }); // 24 hours
});

// Handle tab changes
chrome.tabs.onActivated.addListener((activeInfo) => {
  updateCurrentTab(activeInfo.tabId);
});

// Handle URL changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === currentTabId && changeInfo.url) {
    saveTimeData();
    currentUrl = new URL(changeInfo.url).hostname;
    startTime = Date.now();
  }
});

// Handle browser focus changes
chrome.windows.onFocusChanged.addListener((windowId) => {
  if (windowId === chrome.windows.WINDOW_ID_NONE) {
    // Browser lost focus
    saveTimeData();
    currentTabId = null;
    currentUrl = null;
  } else {
    // Browser gained focus
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        updateCurrentTab(tabs[0].id);
      }
    });
  }
});

// Handle alarms for daily processing
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'dailyReset') {
    processAndPrepareData();
  }
});

// Save current session data
function saveTimeData() {
  if (currentUrl && startTime) {
    const endTime = Date.now();
    const timeSpent = endTime - startTime;
    
    if (timeSpent > 1000) { // Only record if more than 1 second
      const today = new Date().toISOString().split('T')[0];
      
      chrome.storage.local.get(['timeData'], (result) => {
        const timeData = result.timeData || {};
        
        if (!timeData[today]) {
          timeData[today] = {};
        }
        
        if (!timeData[today][currentUrl]) {
          timeData[today][currentUrl] = 0;
        }
        
        timeData[today][currentUrl] += timeSpent;
        chrome.storage.local.set({ timeData });
      });
    }
    
    startTime = endTime;
  }
}

// Update current tab information
function updateCurrentTab(tabId) {
  saveTimeData();
  currentTabId = tabId;
  
  chrome.tabs.get(tabId, (tab) => {
    if (tab.url && tab.url.startsWith('http')) {
      currentUrl = new URL(tab.url).hostname;
      startTime = Date.now();
    } else {
      currentUrl = null;
    }
  });
}

// Process data for weekly reports
function processAndPrepareData() {
  saveTimeData(); // Save current session data
  
  chrome.storage.local.get(['timeData', 'categories', 'weeklyReports'], (result) => {
    const timeData = result.timeData || {};
    const categories = result.categories || siteCategories;
    const weeklyReports = result.weeklyReports || [];
    
    const today = new Date();
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    
    // Calculate weekly stats
    let weekStats = {
      productive: 0,
      unproductive: 0,
      neutral: 0,
      totalTime: 0,
      startDate: lastWeek.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0],
      topSites: {},
      dailyBreakdown: {}
    };
    
    // Process last 7 days of data
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      if (timeData[dateStr]) {
        weekStats.dailyBreakdown[dateStr] = {
          productive: 0,
          unproductive: 0,
          neutral: 0,
          total: 0
        };
        
        Object.entries(timeData[dateStr]).forEach(([site, time]) => {
          // Categorize time
          let category = 'neutral';
          if (categories.productive.some(domain => site.includes(domain))) {
            category = 'productive';
          } else if (categories.unproductive.some(domain => site.includes(domain))) {
            category = 'unproductive';
          }
          
          // Add to weekly totals
          weekStats[category] += time;
          weekStats.totalTime += time;
          
          // Add to daily breakdown
          weekStats.dailyBreakdown[dateStr][category] += time;
          weekStats.dailyBreakdown[dateStr].total += time;
          
          // Track top sites
          if (!weekStats.topSites[site]) {
            weekStats.topSites[site] = 0;
          }
          weekStats.topSites[site] += time;
        });
      }
    }
    
    // Sort top sites and keep only top 10
    const sortedSites = Object.entries(weekStats.topSites)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
    
    weekStats.topSites = sortedSites;
    
    // Calculate productivity score (0-100)
    const productiveRatio = weekStats.totalTime > 0 ? 
      (weekStats.productive / weekStats.totalTime) : 0;
    weekStats.productivityScore = Math.round(productiveRatio * 100);
    
    // Add report to history and limit to last 10 weeks
    weeklyReports.unshift(weekStats);
    if (weeklyReports.length > 10) {
      weeklyReports.pop();
    }
    
    chrome.storage.local.set({ weeklyReports });
    
    // Clean up old daily data (keep only last 30 days)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const cutoffDate = thirtyDaysAgo.toISOString().split('T')[0];
    
    Object.keys(timeData).forEach(date => {
      if (date < cutoffDate) {
        delete timeData[date];
      }
    });
    
    chrome.storage.local.set({ timeData });
  });
}
