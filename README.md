

# BlocksMC Tracker

BlocksMC Tracker is a **desktop application** designed to monitor and track **player ban statuses** on **BlocksMC Java Edition** servers in real-time. The application uses the **Electron package** for **fast and reliable** performance without unnecessary overhead. The user interface has been enhanced with sound effects to improve responsiveness, and the app now only allows one instance to run at a time, reducing RAM usage and preventing memory leaks.

> **Important:**
> - **Desktop Users (Windows):** This update is **only available for Windows**. Linux and macOS versions are not provided.
> - **Mobile Users:** The previous Android APK version will **never be updated** or maintained. This application is **specifically designed for Java Edition** of **BlocksMC** servers, and no mobile version will be released.

---

## Features

- **Real-Time Ban Monitoring** – Instantly check if a player is banned or unbanned on BlocksMC.
- **Electron Package Communication** – Uses **IPC** requests for **faster, more reliable, and conflict-free** performance.
- **Single Instance Lock** – Prevents multiple instances from opening, reducing RAM usage and avoiding duplicate bot requests.
- **Sound Effects** – Integrated interactive sounds (e.g., for button presses) to enhance the user experience.
- **Stylish Interface** – Clean and modern design with theme options (Legacy and Pink).
- **Erase All Player Usernames** – Quickly clear stored usernames.
- **Lightweight** – Optimized to use minimal resources since it’s solely a ban checker tool.
- **Local Storage** – Uses localStorage to persist session data (no external databases required).
- **Desktop Version Available (Windows Only)** – Easy-to-install version for Windows users.
- **NameSniper Instant Claim** – Instant name claim if a new username is detected.
- **Constant Updates & Bug Fixes** – Regularly updated with new features and fixed bugs.
- **Self-Kicker** – Automatically kicks players if certain conditions are met (useful for avoiding unwanted players).

---

## Prerequisites

- **Node.js** (v22 or higher) – Required due to Mineflayer package conflicts.
- **npm** (Node Package Manager)
- **Basic command-line knowledge**

---

## Installation & Usage

### Desktop Version (Windows)

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/ForgedSengoku/BlocksMCTracker.git
   cd BlocksMCTracker
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```
   *(Ensure `electron`, `electron-builder`, and other dependencies are correctly installed.)*

3. **Testing the App:**
   Launch the Electron app with:
   ```bash
   npm start
   ```
   This command uses your updated `main.js` (which now only allows one instance and communicates via IPC).

4. **Building the App:**
   To compile the app into an executable (.exe) file for Windows, run:
   ```bash
   yarn app:dist
   ```
   *(This uses electron-builder based on your modified package.json, where the main field is set to "main.js".)*

---

## Changelog

### Version 1.0.4

- **Switched to Electron IPC:**  
  Replaced all previous request methods with IPC requests for faster, more reliable performance.

- **Single Instance Lock:**  
  The app now only allows one instance to run at a time, reducing RAM usage and preventing multiple bot requests.

- **Sound Effects Integration:**  
  Added sound effects for button presses and status notifications.

- **Removed Unused Assets:**  
  Cleared unnecessary files to reduce storage usage.

- **Updated Interface:**  
  The interface now fully uses IPC requests to update usernames and ban statuses in real time.

- **Version Update:**  
  The release version has been corrected to **1.0.4**.

---

## How the Features Work

### **Ban Checking:**
The ban checking is done through a **Mineflayer bot** that logs in with the specified username. It interacts with the BlocksMC server and checks the player’s ban status in real-time.

### **NameSniper:**
NameSniper is designed to instantly claim a username once it's available. However, it may have some limitations:
- **Buggy Performance:** It may sometimes fail due to unstable internet connections or being rate-limited by BlocksMC.
- **Internet Issues:** If your internet connection is interrupted, the NameSniper might not work properly.

### **Self-Kicker:**
The Self-Kicker is a feature that kicks players if they meet specific conditions, such as entering specific usernames. This feature can be useful to automatically remove unwanted players but can also be risky if not configured properly.

### **Connection Blocker:**
The **Connection Blocker** works by sending 1000 bot connections to **overload** the server, causing a **rate-limiting effect**. This can be useful in environments like school Wi-Fi where access to BlocksMC is restricted, but it’s a **high-risk** feature. Use it responsibly, as it may result in severe consequences if abused.

---

## What We Cannot Do Right Now:

- **Check Premium Accounts:**  
  Currently, we cannot check premium accounts, but it may be possible in the future if they are not in "premium mode" or if they are cracked accounts.

- **NameSniper Performance:**  
  There are no guarantees that NameSniper will always work as expected. Bugs may occur, especially if there are interruptions in your internet or rate-limiting happens.

---

## Compiling, Forking, and Modifying

If you wish to fork, modify, or decompile the project further, follow these steps:

1. **Fork the Repository:**  
   Click the "Fork" button on GitHub to create your own copy of the project.

2. **Clone Your Fork:**
   ```bash
   git clone https://github.com/yourusername/BlocksMCTracker.git
   cd BlocksMCTracker
   ```

3. **Install Dependencies:**  
   ```bash
   npm install
   ```

4. **Make Your Modifications:**  
   Update the code, add features, or change configurations as needed. Your changes will take effect after restarting the app.

5. **Run Your Version:**  
   For testing, run:
   ```bash
   npm start
   ```

6. **Build the App:**  
   To compile your modified version into an executable, run:
   ```bash
   yarn app:dist
   ```

Below is an example of the `package.json` file (with modifications) used for building the app:

```json
{
  "name": "blocksmctracker",
  "version": "1.1.1",
  "main": "main.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "electron .",
    "serve": "node main.js",
    "app:dir": "electron-builder --dir",
    "app:dist": "electron-builder",
    "postinstall": "electron-builder install-app-deps"
  },
  "keywords": [],
  "author": "ForgedSengoku",
  "license": "ISC",
  "dependencies": {
    "electron-updater": "^6.3.9",
    "mineflayer": "^4.26.0",
    "mojang-api": "^0.0.2"
  },
  "devDependencies": {
    "electron": "^34.2.0",
    "electron-builder": "^25.1.8"
  },
  "build": {
    "appId": "com.blocksmctracker.app",
    "productName": "BlocksMC Tracker",
    "artifactName": "BlocksMC-Tracker-Setup-${version}.${ext}",
    "files": [
      "main.js",
      "bot.js",
      "namesniper.js",
      "package.json",
      "preload.js",
      "selfkick.js",
      "ratelimit.js",
      "ipaccountevader.js",
      "public/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "public/icon.ico"
    },
    "publish": {
      "provider": "github",
      "owner": "ForgedSengoku",
      "repo": "BlocksMCTracker"
    }
  },
  "description": "BlocksMC Tracker App"
}


```

---

## Configuration

- **Change Port (if needed):**  
  Modify any port settings in your bot or namesniper modules, though with IPC there’s no server port to worry about.
- **Storage:**  
  Local session data is stored using localStorage, ensuring persistence without external databases.

---

## Privacy

- Session data (like local storage cookies) is stored **only on your local device**.
- No user information is transmitted to external servers.
- Only the player's username is sent to verify ban status.

---

## Troubleshooting

- **Port Conflicts:**  
  With the switch to IPC requests, there are no longer any port conflicts. Ensure no legacy server processes are running.
- **Installation Errors:**  
  Verify that **Node.js** and **npm** are installed correctly by running `node -v` and `npm -v`.
- **Audio Issues:**  
  Check that your audio file paths are correct and that your system supports HTML5 audio playback.

---

## Disclaimer

This project is **not affiliated** with BlocksMC. Use it responsibly and in compliance with BlocksMC's terms of service.

**⭐ Star this repo if you find it useful!**  
Report issues at [GitHub Issues](https://github.com/ForgedSengoku/BlocksMCTracker/issues). 

