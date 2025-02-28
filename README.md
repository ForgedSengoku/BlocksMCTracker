
# BlocksMC Tracker

BlocksMC Tracker is an **Electron App** designed to monitor and track **player ban statuses** on BlocksMC in real-time. With the latest update, the app now uses **Electron IPC requests** instead of Express/Socket.IO, eliminating port conflicts and reducing unnecessary overhead. The user interface has been enhanced to include sound effects (e.g., when a button is pressed) for a more responsive experience. Additionally, the app now allows only a single instance to run at a time to conserve RAM and avoid memory leaks.

> **Important:**
> - **Desktop Users (Windows):** This update is available **only for Windows**. Linux and macOS versions are not provided.
> - **Mobile Users:** The previous Android APK version is no longer maintained. If you need a mobile version, you can build your own solution using the source code.

---

## Features

- **Real-Time Ban Monitoring** – Instantly check if a player is banned or unbanned on BlocksMC.
- **IPC-Based Communication** – Fully uses Electron's IPC requests for **faster, more reliable, and conflict-free** performance.
- **Single Instance Lock** – Prevents multiple instances from opening, reducing RAM usage and avoiding duplicate bot requests.
- **Sound Effects** – Integrated interactive sounds (e.g., for button presses) to enhance the user experience.
- **Stylish Interface** – Clean and modern design with theme options (Legacy and Pink).
- **Erase All Player Usernames** – Quickly clear stored usernames.
- **Lightweight** – Optimized to use minimal resources since it’s solely a ban checker tool.
- **Local Storage** – Uses localStorage to persist session data (no external databases required).
- **Desktop Version Available (Windows Only)** – Easy-to-install version for Windows users.

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
   *(Make sure `electron`, `electron-builder`, and other dependencies are correctly installed.)*

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

### Note for Mobile Users

**There is no official Android version** of BlocksMC Tracker anymore. Electron does not support mobile platforms directly, and the APK is no longer maintained. However, if you’re inclined to create your own mobile version, the source code is available for you to modify and build as needed.

---

## Changelog

### Version 1.0.4

- **Switched to Electron IPC:**  
  Replaced all `socket.io` and `express` requests with IPC requests. This eliminates port conflicts (e.g., with users’ own Minecraft servers) and makes communication much faster.

- **Single Instance Lock:**  
  The app now allows only one instance at a time, preventing multiple windows from opening and reducing RAM usage.

- **Sound Effects Integration:**  
  Added sound effects for button presses and status notifications, improving user interactivity.

- **Removed Unused Assets:**  
  Cleared out unnecessary files to free up storage and reduce bloat.

- **Updated index.html:**  
  Modified the ban tracker interface to work entirely with IPC requests—ensuring that the "last checked" username and previous username lists update instantly.

- **Package.json Modifications:**  
  - Changed the main entry from `server.js` to `main.js`.
  - Removed Express and Socket.IO dependencies.
  - Updated build instructions; users now run `yarn app:dist` to build the app.
  
- **Versioning Update:**  
  Corrected version numbering from previous releases (all earlier versions were marked as 1.0.0). The current release is **1.0.4**.

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
  "version": "1.0.4",
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
  "author": "",
  "license": "ISC",
  "dependencies": {
    "minecraft-api": "^0.0.3",
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
    "files": [
      "main.js",
      "bot.js",
      "namesniper.js",
      "package.json",
      "preload.js",
      "public/**/*"
    ],
    "win": {
      "target": "nsis",
      "icon": "public/icon.ico"
    }
  },
  "description": "Tracker APP"
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
