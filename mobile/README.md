# Green Call CRM - Mobile App (React Native)

## 📱 Mobile App Setup Guide

### ✅ Features
- Same backend API as web (NO backend changes needed)
- Login/Signup with authentication
- Dashboard with real-time stats
- Lead management (View, Add, Search)
- Customer management
- Offline storage with AsyncStorage
- Native Android features ready

---

## 🚀 Installation Steps

### 1. Prerequisites
```bash
# Install Node.js (v18 or higher)
# Install Android Studio
# Install Java JDK 17
```

### 2. Install Dependencies
```bash
cd mobile
npm install
```

### 3. Configure Backend URL
Edit `src/config/config.js`:
```javascript
api: {
  baseUrl: 'http://YOUR_COMPUTER_IP:5004/api'  // Change localhost to your IP
}
```

**Find your IP:**
```bash
# Windows
ipconfig

# Look for IPv4 Address (e.g., 192.168.1.100)
```

### 4. Start Metro Bundler
```bash
npm start
```

### 5. Run on Android
```bash
# In new terminal
npm run android
```

---

## 📂 Project Structure

```
mobile/
├── src/
│   ├── screens/          # All app screens
│   │   ├── LoginScreen.js
│   │   ├── DashboardScreen.js
│   │   ├── MyLeadsScreen.js
│   │   └── AddLeadScreen.js
│   ├── navigation/       # Navigation setup
│   │   └── AppNavigator.js
│   ├── services/         # API calls (same as web)
│   │   └── api.js
│   ├── config/           # Configuration
│   │   └── config.js
│   └── utils/            # Utilities
│       └── storage.js
├── android/              # Android native code
├── App.js               # Main app component
└── package.json         # Dependencies
```

---

## 🔌 API Integration

### Same Backend APIs Used:
- ✅ `/api/auth/login` - Login
- ✅ `/api/auth/signup` - Signup
- ✅ `/api/leads` - Get all leads
- ✅ `/api/leads` (POST) - Create lead
- ✅ `/api/customers` - Get customers

**NO backend changes needed!** 🎉

---

## 📱 Screens Implemented

### 1. Login Screen
- Email/Password authentication
- Same API as web
- AsyncStorage for token

### 2. Dashboard Screen
- Real-time stats
- Total leads, new leads, customers
- Quick actions
- Pull to refresh

### 3. My Leads Screen
- List all leads
- Search functionality
- Status badges
- Pull to refresh

### 4. Add Lead Screen
- Form to add new lead
- Validation
- Same API as web

---

## 🔧 Configuration

### Change Backend URL for Real Device:
1. Find your computer's IP address
2. Edit `src/config/config.js`:
```javascript
baseUrl: 'http://192.168.1.100:5004/api'  // Your IP
```

3. Make sure backend server is running:
```bash
cd ../server
npm start
```

---

## 📦 Build APK

### Debug APK (for testing):
```bash
cd android
./gradlew assembleDebug
```
APK location: `android/app/build/outputs/apk/debug/app-debug.apk`

### Release APK (for production):
```bash
cd android
./gradlew assembleRelease
```

---

## 🎯 Next Steps

### Additional Screens to Add:
- [ ] Signup Screen
- [ ] Forgot Password Screen
- [ ] Lead Detail Screen
- [ ] Customer List Screen
- [ ] Profile Screen
- [ ] Settings Screen

### Native Features to Add:
- [ ] WhatsApp Integration
- [ ] GPS Location Tracking
- [ ] Push Notifications
- [ ] Camera for documents
- [ ] Phone contacts integration

---

## 🐛 Troubleshooting

### Metro Bundler Issues:
```bash
npm start -- --reset-cache
```

### Android Build Issues:
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### Cannot Connect to Backend:
1. Check backend is running on port 5004
2. Use computer IP, not localhost
3. Check firewall settings
4. Make sure phone and computer on same WiFi

---

## 📝 Important Notes

### ✅ What's Done:
- React Native project setup
- Navigation (Stack + Bottom Tabs)
- API integration (same as web)
- Login, Dashboard, Leads screens
- AsyncStorage for offline data
- Android configuration

### ⚠️ What's NOT Changed:
- Web frontend (client folder) - UNTOUCHED
- Backend (server folder) - UNTOUCHED
- Database - UNTOUCHED

### 🎉 Benefits:
- Separate mobile app
- Same backend API
- No web changes
- Easy to maintain
- Native Android features ready

---

## 🚀 Quick Start Commands

```bash
# Install dependencies
cd mobile
npm install

# Start Metro
npm start

# Run Android (new terminal)
npm run android

# Build APK
cd android
./gradlew assembleDebug
```

---

## 📞 Support

For issues or questions:
- Email: navneetkumar6263101@gmail.com
- Check backend is running on port 5004
- Ensure correct IP address in config

---

**Green Call CRM Mobile** - Built with React Native ❤️
