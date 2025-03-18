# CHROME-EXTENSION-FOR-TIME-TRACKING-AND-PRODUCTIVITY-ANALYTICS

## Overview
My project is a Chrome extension that helps users monitor and analyze their web browsing habits. The extension tracks time spent on different websites, categorizes them as productive or unproductive, and provides detailed productivity analytics through an intuitive dashboard.

## Features

### Time Tracking
- **Automatic Website Tracking**: Records time spent on each website
- **Background Operation**: Continues tracking even when Chrome is minimized
- **Session Awareness**: Detects user idle time and active browsing sessions

### Website Classification
- **Smart Categorization**: Automatically classifies websites as productive or unproductive
- **Custom Categories**: Users can create their own website categories
- **Override Options**: Ability to reclassify websites based on personal workflow

### Analytics Dashboard
- **Daily/Weekly/Monthly Reports**: Visual breakdown of browsing habits over time
- **Productivity Score**: Overall productivity rating based on browsing patterns
- **Website Rankings**: Shows most visited productive and unproductive sites
- **Time Distribution**: Pie charts and graphs showing time allocation

### Additional Features
- **Goal Setting**: Set daily productivity targets and receive notifications
- **Focus Mode**: Option to block distracting websites during designated work periods
- **Data Export**: Export your analytics data in CSV format
- **Privacy Controls**: All data stays on your local machine by default with optional cloud sync







### Viewing Analytics
1. Click the extension icon to see a quick summary
2. Select "Open Dashboard" for detailed analytics
3. Use filters and date ranges to customize your reports

### Customizing Categories
1. Navigate to Settings > Categories
2. Add websites to your productive or unproductive lists
3. Create custom categories for different types of work or leisure

## Privacy & Data Security
- All browsing data is stored locally by default
- Optional cloud sync with end-to-end encryption
- No data is shared with third parties
- User has complete control to delete all stored data at any time

## Technical Details
- Backend: Node.js with Express
- Database: MongoDB for cloud storage, IndexedDB for local storage
- Frontend: React.js with Chart.js for visualizations
- Authentication: JWT tokens with secure refresh mechanism

## Development

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Chrome browser

### Setup Development Environment
```bash
# Clone the repository
git clone https://github.com/yourusername/CHROME-EXTENSION-FOR-TIME-TRACKING-AND-PRODUCTIVITY-ANALYTICS.git

# Navigate to directory
cd CHROME-EXTENSION-FOR-TIME-TRACKING-AND-PRODUCTIVITY-ANALYTICS

# Install dependencies
npm install

# Build for development
npm run dev
```

### Project Structure
```
CHROME-EXTENSION-FOR-TIME-TRACKING-AND-PRODUCTIVITY-ANALYTICS/
├── src/                  # Source files
│   ├── background/       # Chrome background scripts
│   ├── components/       # React components
│   ├── utils/            # Utility functions
│   └── api/              # API services
├── public/               # Static assets
├── server/               # Backend server code
└── manifest.json         # Extension manifest
```


