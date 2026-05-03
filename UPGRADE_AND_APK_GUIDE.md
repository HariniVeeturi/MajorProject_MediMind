# MediMind — Upgrade Guide & APK Build Instructions

## What Was Upgraded

### 1. 🤖 Reinforcement Learning (RL) Tips Engine
**File:** `services/rlService.ts`

Implements a **UCB1 Multi-Armed Bandit** algorithm:
- Every tip is an "arm" of the bandit
- When you tap "Helpful" → reward = 1; "Not helpful" → reward = 0
- UCB1 score = `avg_reward + √(2·ln(total_trials) / arm_trials)`
- The exploration bonus ensures new/unseen tips still surface
- Tips are **re-ranked in real time** after every feedback
- State persists in `localStorage` across app restarts
- A **⭐ Top tip for you** badge appears once a tip reaches ≥60% helpful rate

### 2. 🧠 Explainable AI (XAI) Layer
**File:** `services/xaiService.ts`

Implements a **SHAP-inspired feature attribution** system:
- Each recommendation has a "Why was I shown this?" panel
- Feature bars (0–100%) show how much each factor in your profile contributed
- Blue bar = positive driver, Amber bar = caution factor
- Runs fully client-side — no extra API call
- Example: "Hypertension → 90% influence on diet tip about sodium"

### 3. ✅ Updated Types
**File:** `types.ts`
- `Recommendation` now includes `feedback`, `xaiFeatures`
- New interfaces: `XAIFeature`, `TipBanditState`, `RLState`
- `UserData` includes optional `rlState`

---

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

Also set your API key in `android/app/src/main/res/values/strings.xml`:
```xml
<string name="gemini_api_key">YOUR_API_KEY_HERE</string>
```

Or inject it via environment in your vite build:
```bash
VITE_API_KEY=your_key_here npm run build
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

---

## Notes
- The Gemini API key must be set at build time via environment variable
- The RL model state and XAI features are fully offline — only tip **generation** needs internet
- The app is a PWA — it can also be added to home screen on Android without APK via Chrome → "Add to Home Screen"
