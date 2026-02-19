# Basketball Stats Tracker

A real-time basketball statistics tracking app for coaches. Track player stats during games using buttons or voice input. Works on Mac, iPhone, and iPad as a Progressive Web App (PWA).

## Features

- **Roster Management**: Add players with names and jersey numbers
- **Real-time Stat Tracking**: Record stats during games with button clicks
- **Voice Input**: Use voice commands like "Number 5 two pointer" or "12 assist"
- **Live Totals**: See running statistics for all players and team totals
- **CSV Export**: Export game statistics to CSV for analysis
- **PWA Support**: Install as an app on your device for offline use

## Stats Tracked

- Points (2PT and 3PT made/missed)
- Rebounds
- Assists
- Steals
- Blocks
- Fouls
- Turnovers

## Getting Started

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open your browser to the URL shown (typically `http://localhost:5173`)

### Running on iPhone/iPad

**Option 1: Development Server (Same Wi-Fi Network)**

1. On your Mac, run:
   ```bash
   npm run dev
   ```

2. Find your Mac's IP address:
   - Open System Settings → Network
   - Note your IP address (e.g., `192.168.1.100`)

3. On your iPhone/iPad (connected to the same Wi-Fi):
   - Open Safari
   - Go to `http://YOUR_MAC_IP:5173` (e.g., `http://192.168.1.100:5173`)
   - The app will load and you can add it to your home screen

**Option 2: Deploy to Production (Recommended for Regular Use)**

1. Build the app:
   ```bash
   npm run build
   ```

2. Deploy to a free hosting service:
   - **Vercel**: `npm install -g vercel && vercel`
   - **Netlify**: Drag the `dist` folder to [netlify.com/drop](https://app.netlify.com/drop)
   - **GitHub Pages**: Push to GitHub and enable Pages

3. Access from any device via the hosted URL

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

### Installing as PWA

**On iPhone/iPad:**
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

**On Mac:**
1. Open the app in Chrome or Safari
2. Click the install icon in the address bar
3. Follow the prompts to install

## Usage

1. **Pre-game**: Add players to your roster with names and jersey numbers
2. **During game**: 
   - Select a player by tapping their card
   - Record stats by tapping buttons or using voice commands
3. **Post-game**: View summary, export to CSV, or start a new game

## Voice Commands

Try saying:
- "Number 5 two pointer" - Records a 2PT make for player #5
- "12 assist" - Records an assist for player #12
- "Rebound 7" - Records a rebound for player #7
- "Sarah steal" - Records a steal for player named Sarah

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Web Speech API
- Progressive Web App (PWA)

## Browser Support

- Chrome/Edge (desktop and mobile)
- Safari (iOS and macOS)
- Firefox (desktop)

Note: Voice input requires browser support for the Web Speech API. Safari on iOS requires iOS 14.5+.
