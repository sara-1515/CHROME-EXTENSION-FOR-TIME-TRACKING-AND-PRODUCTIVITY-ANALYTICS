document.addEventListener('DOMContentLoaded', function() {
    // Load categories
    loadCategories();
    
    // Add event listeners
    document.getElementById('add-productive-btn').addEventListener('click', () => addSite('productive'));
    document.getElementById('add-unproductive-btn').addEventListener('click', () => addSite('unproductive'));
    document.getElementById('export-data-btn').addEventListener('click', exportData);
    document.getElementById('clear-data-btn').addEventListener('click', clearData);
    
    // Load notification settings
    loadNotificationSettings();
    
    // Add event listener for notification settings
    document.getElementById('enable-notifications').addEventListener('change', saveNotificationSettings);
    document.getElementById('notification-threshold').addEventListener('change', saveNotificationSettings);
    
    // Setup drag and drop
    setupDragAndDrop();
  });
  
  function loadCategories() {
    chrome.storage.local.get(['categories'], function(result) {
      const categories = result.categories || {
        productive: [
          "github.com",
          "stackoverflow.com",
          "gitlab.com",
          "docs.google.com",
          "trello.com"
        ],
        unproductive: [
          "facebook.com",
          "instagram.com",
          "twitter.com",
          "reddit.com",
          "youtube.com"
        ]
      };
      
      // Populate productive sites
      const productiveList = document.getElementById('productive-list');
      categories.productive.forEach(site => {
        const siteItem = createSiteItem(site, 'productive');
        productiveList.appendChild(siteItem);
      });
      
      // Populate unproductive sites
      const unproductiveList = document.getElementById('unproductive-list');
      categories.unproductive.forEach(site => {
        const siteItem = createSiteItem(site, 'unproductive');
        unproductiveList.appendChild(siteItem);
      });
    });
  }
  
  function createSiteItem(site, category) {
    const item = document.createElement('div');
    item.className = 'site-item';
    item.draggable = true;
    item.dataset.site = site;
    
    item.innerHTML = `
      <div class="site-name">
        <img class="site-icon" src="https://www.google.com/s2/favicons?domain=${site}" alt="" />
        ${site}
      </div>
      <div class="remove-site" data-site="${site}" data-category="${category}">×</div>
    `;
    
    // Add event listener for remove button
    item.querySelector('.remove-site').addEventListener('click', function() {
      removeSite(site, category);
      item.remove();
    });
    
    // Add drag events
    item.addEventListener('dragstart', handleDragStart);
    
    return item;
  }
  
  function addSite(category) {
    const input = document.getElementById(`add-${category}-input`);
    const site = input.value.trim();
    
    if (!site) return;
    
    // Basic validation
    if (!site.includes('.')) {
      alert('Please enter a valid domain (e.g., github.com)');
      return;
    }
    
    // Add to storage
    chrome.storage.local.get(['categories'], function(result) {
      const categories = result.categories || {
        productive: [],
        unproductive: []
      };
      
      // Check if site already exists in either category
      const existsInProductive = categories.productive.includes(site);
      const existsInUnproductive = categories.unproductive.includes(site);
      
      if (existsInProductive || existsInUnproductive) {
        alert('This site is already categorized.');
        return;
      }
      
      categories[category].push(site);
      chrome.storage.local.set({ categories });
      
      // Add to UI
      const categoryList = document.getElementById(`${category}-list`);
      const siteItem = createSiteItem(site, category);
      categoryList.appendChild(siteItem);
      
      // Clear input
      input.value = '';
    });
  }
  
  function removeSite(site, category) {
    chrome.storage.local.get(['categories'], function(result) {
      const categories = result.categories || {
        productive: [],
        unproductive: []
      };
      
      categories[category] = categories[category].filter(s => s !== site);
      chrome.storage.local.set({ categories });
    });
  }
  
  function moveSite(site, fromCategory, toCategory) {
    chrome.storage.local.get(['categories'], function(result) {
      const categories = result.categories || {
        productive: [],
        unproductive: []
      };
      
      // Remove from old category
      categories[fromCategory] = categories[fromCategory].filter(s => s !== site);
      
      // Add to new category
      if (!categories[toCategory].includes(site)) {
        categories[toCategory].push(site);
      }
      
      chrome.storage.local.set({ categories });
    });
  }
  
  function loadNotificationSettings() {
    chrome.storage.local.get(['notificationSettings'], function(result) {
      const settings = result.notificationSettings || {
        enabled: true,
        threshold: 30 // minutes
      };
      
      document.getElementById('enable-notifications').checked = settings.enabled;
      document.getElementById('notification-threshold').value = settings.threshold;
    });
  }
  
  function saveNotificationSettings() {
    const enabled = document.getElementById('enable-notifications').checked;
    const threshold = document.getElementById('notification-threshold').value;
    
    const settings = {
      enabled,
      threshold: parseInt(threshold)
    };
    
    chrome.storage.local.set({ notificationSettings: settings });
  }
  
  function exportData() {
    chrome.storage.local.get(['timeData', 'weeklyReports', 'categories'], function(result) {
      const dataStr = JSON.stringify(result, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'productivity_data.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    });
  }
  
  function clearData() {
    if (confirm('Are you sure you want to clear all tracked data? This cannot be undone.')) {
      chrome.storage.local.clear(function() {
        alert('All data has been cleared.');
        location.reload();
      });
    }
  }
  
  function setupDragAndDrop() {
    const categoryLists = document.querySelectorAll('.category-list');
    
    categoryLists.forEach(list => {
      list.addEventListener('dragover', handleDragOver);
      list.addEventListener('dragleave', handleDragLeave);
      list.addEventListener('drop', handleDrop);
    });
  }
  
  function handleDragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.dataset.site);
    e.dataTransfer.setData('category', e.target.parentElement.dataset.category);
    e.target.classList.add('dragging');
  }
  
  function handleDragOver(e) {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  }
  
  function handleDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
  }
  
  function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    const site = e.dataTransfer.getData('text/plain');
    const fromCategory = e.dataTransfer.getData('category');
    const toCategory = e.currentTarget.dataset.category;
    
    if (fromCategory !== toCategory) {
      // Move site between categories
      moveSite(site, fromCategory, toCategory);
      
      // Remove from old list
      const oldItem = document.querySelector(`.site-item[data-site="${site}"]`);
      if (oldItem) {
        oldItem.remove();
      }
      
      // Add to new list
      const newItem = createSiteItem(site, toCategory);
      e.currentTarget.appendChild(newItem);
    }
  }