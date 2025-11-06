# Rummy Score Tracker - Expo Go Instructions

## 📱 How to Load in Expo Go

### Method 1: Direct URL (Easiest)
1. Open Expo Go app on your mobile device
2. In Expo Go, tap "Scan QR Code" or enter URL manually
3. Enter one of these URLs:
   - **Production:** `http://172.19.13.106:3001/` or `http://172.19.13.107:3001/`
   - **Development:** `http://172.19.13.106:3000/` or `http://172.19.13.107:3000/`

### Method 2: QR Code
1. Copy this URL: `http://172.19.13.106:3001/`
2. Use any QR code generator to create a QR code
3. Scan the QR code with Expo Go

## 🎮 Features Available

✅ **Pool Rummy Games**: 101, 201, 301 point variants
✅ **2-6 Players**: Custom names or auto-numbered
✅ **Touch-Optimized**: 44px minimum touch targets
✅ **Mobile-First Design**: Responsive layout
✅ **Score Tracking**: Complete round history
✅ **Drop System**: 20-point penalties
✅ **Elimination Logic**: Automatic detection
✅ **Beautiful UI**: Modern, clean interface

## 📱 Mobile Optimizations Applied

- **Touch Targets**: Minimum 44px for easy tapping
- **No Zoom**: Font size 16px prevents iOS zoom
- **Safe Areas**: Respect device notches/bars
- **Smooth Scrolling**: Native mobile scrolling
- **Tap Highlight**: Removed for clean interaction
- **Viewport Fixed**: Prevents unwanted scaling

## 🚀 Performance

- **Fast Loading**: Optimized bundle (216KB)
- **Offline Ready**: Works without internet
- **PWA Compatible**: Can be installed as web app
- **Responsive**: Adapts to any screen size

## 🎯 How to Use

1. **Game Setup**: Select game type and player count
2. **Enter Names**: Use custom names or auto-number
3. **Start Playing**: Add scores round by round
4. **Track Progress**: View complete score history
5. **Handle Drops**: 20-point penalty for dropped players
6. **Win Detection**: Automatic winner calculation

## 🔧 Technical Details

- **Framework**: React + TypeScript + Vite
- **Styling**: Tailwind CSS (mobile-first)
- **Navigation**: React Router
- **State**: Zustand state management
- **Build**: Optimized production build

The app is designed to work perfectly in Expo Go's web view, providing a native-like experience for mobile Rummy score tracking!