# WebTimeTracker - Chrome Productivity Extension

## Overview
WebTimeTracker is a Chrome extension that helps users monitor and analyze their web browsing habits. The extension tracks time spent on different websites, categorizes them as productive or unproductive, and provides detailed productivity analytics through an intuitive dashboard.

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

## Installation

### From Chrome Web Store
1. Navigate to the [Chrome Web Store](https://chrome.google.com/webstore)
2. Search for "WebTimeTracker"
3. Click "Add to Chrome"

### Manual Installation (Developer Mode)
1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top-right corner
4. Click "Load unpacked" and select the extension directory

## Usage

### Getting Started
1. After installation, click on the WebTimeTracker icon in your Chrome toolbar
2. Go through the initial setup to configure your preferences
3. The extension will immediately begin tracking your browsing activity

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
git clone https://github.com/yourusername/web-time-tracker.git

# Navigate to directory
cd web-time-tracker

# Install dependencies
npm install

# Build for development
npm run dev
```

### Project Structure
```
web-time-tracker/
├── src/                  # Source files
│   ├── background/       # Chrome background scripts
│   ├── components/       # React components
│   ├── utils/            # Utility functions
│   └── api/              # API services
├── public/               # Static assets
├── server/               # Backend server code
└── manifest.json         # Extension manifest
```

## Contributing
We welcome contributions to WebTimeTracker! Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support
For support, feature requests, or bug reports, please open an issue on our [GitHub repository](https://github.com/yourusername/web-time-tracker/issues) or contact support@webtimetracker.com.
