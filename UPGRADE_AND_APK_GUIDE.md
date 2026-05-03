# MediMind — Upgrade Guide & APK Build Instructions

## How to Build an APK

### Prerequisites (install once)
1. **Node.js 18+** — https://nodejs.org
2. **Java JDK 17** — https://adoptium.net
3. **Android Studio** — https://developer.android.com/studio
   - During setup, install: Android SDK, Android SDK Build-Tools, Android Emulator
4. Set environment variables:
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
   ```

### Step 1: Install dependencies & build the web app
```bash
cd "medimind (1)"
npm install
npm run build
```

### Step 2: Add Android platform (first time only)
```bash
npm install @capacitor/android
npx cap add android
```

### Step 3: Sync web build to Android
```bash
npx cap sync android
```

### Step 4: Set your Gemini API key
Open `android/app/src/main/assets/capacitor.config.json` and add:
```json
{
  "plugins": {
    "CapacitorHttp": {
      "enabled": true
    }
  },
  "server": {
    "androidScheme": "https"
  }
}
```
### Step 5: Open in Android Studio & build APK
```bash
npx cap open android
```
Then in Android Studio:
- **Build → Build Bundle(s) / APK(s) → Build APK(s)**
- APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

### Step 6: Install on your phone
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```
Or simply share the .apk file and open it on your Android device (enable "Install from unknown sources" in Settings).

---

## For a Release/Signed APK (for Play Store)
```bash
# In Android Studio: Build → Generate Signed Bundle/APK
# Create a keystore, fill details, build Release APK
```

