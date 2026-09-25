# Smart Pet Feeder - Android Studio Project Guide

This project is configured with a complete, native **Android Studio** project ready to open, build, and run on Android devices and emulators.

---

## 🚀 How to Open in Android Studio

### Method 1: Open the `android` Folder Directly in Android Studio (Easiest)
1. Export or download this project ZIP from Google AI Studio (via **Settings > Export to ZIP** or **GitHub**).
2. Launch **Android Studio**.
3. Select **Open an Existing Project** (or **File > Open**).
4. Browse to the downloaded project and select the **`android`** folder (e.g., `/your-project-path/android`).
5. Click **OK / Open**.
6. Wait for Android Studio to finish Gradle Sync.
7. Click the green **Run ▶** button to run the app on an Android emulator or physical device, or choose **Build > Build Bundle(s) / APK(s) > Build APK(s)** to generate your `.apk`.

---

### Method 2: Using the Command Line
If you have Android Studio installed and your environment configured:
```bash
# 1. Install dependencies
npm install

# 2. Build web assets and sync to Android
npm run cap:sync

# 3. Launch Android Studio directly
npm run cap:open
```

---

## 📱 What is Included
- **Native Android Project**: Located in `/android`, including `build.gradle`, `settings.gradle`, and `gradlew`.
- **Package Name**: `com.petfeeder.app`
- **Application Name**: Smart Pet Feeder
- **Compiled Assets**: Automatically bundled inside `android/app/src/main/assets/public`.
- **Permissions**: Internet permission configured in `AndroidManifest.xml`.
- **Theme & Status Bar**: Styled with emerald green (`#10B981`) matching the app's visual identity.
- **Full Responsive Touch Support**: Optimized for Android WebViews with safe-area insets, mobile touch targets, and disabled bounce/overscroll glitches.
