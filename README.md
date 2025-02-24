
---
# BlocksMC Tracker

BlocksMC Tracker is an **Electron App** designed to monitor and track **player ban statuses** on BlocksMC in real-time. It features a sleek interface and can be easily hosted locally. Note that the website version has been discontinued for a simpler setup. The project now provides an Electron desktop app for Windows and an APK for Android devices.

> **Important:**
> - **Mobile Users:** Electron is not supported in Termux. For Android devices, download the APK file from [GitHub Releases](https://github.com/ForgedSengoku/BlocksMCTracker/releases) for a simpler, streamlined setup.
> - **Desktop Users:** This version is available **only for Windows**. Linux and macOS versions are not provided.

---

## Features

- **Real-Time Ban Monitoring** – Instantly check if a player is banned or unbanned on BlocksMC.
- **Mobile-Friendly** – For Android users, an APK file is available for easy installation.
- **Stylish Interface** – Clean and modern design for a seamless user experience.
- **Pink Theme** – A sleek pink-colored UI for a fresh look.
- **Erase All Player Usernames** – Useful for clearing space when tracking thousands of usernames.
- **Lightweight** – Doesn’t require many resources since it’s only a ban checker tool.
- **Local Hosting** – Defaults to `localhost:3052` for quick setup and testing.
- **Automatic Updates** – Continuously refreshes player status without manual intervention.
- **Cookie Storage** – Stores cookies locally for session persistence (no external databases required).
- **Desktop Version Available (Windows Only)** – An easy-to-install version for Windows users.

---

## Prerequisites

- **Node.js** (v22 or higher) – Required due to Mineflayer package conflicts.
- **npm** (Node Package Manager)
- **Termux** (for Android users, though Electron is not supported there)
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

3. **Testing the App:**
   Press:
   ```bash
   npm start
   ```
   This command launches the Electron app for testing.

4. **Building the App:**
   To compile the app into an executable (.exe) file for Windows, run:
   ```bash
   yarn app:dist
   ```

### Mobile (Android APK) Setup

Since Electron cannot be installed in Termux, use the provided APK for Android:

1. **Download the APK:**  
   Visit [GitHub Releases](https://github.com/ForgedSengoku/BlocksMCTracker/releases) and download the latest APK file.
2. **Install the APK:**  
   Open the APK file on your Android device and follow the installation prompts.

**Why It Works on a Phone:**  
Android devices share similarities with ARM64 laptops, and while Node.js supports ARM, Electron cannot be used in Termux. The APK offers a streamlined mobile experience.

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
   Install the required packages using:
   ```bash
   npm install
   ```

4. **Make Your Modifications:**  
   Update the code, add features, or change configurations as needed. Your changes will take effect after restarting the app.

5. **Run Your Version:**  
   For testing to open electron, simply run:
   ```bash
   npm start
   ```

6. **Build the App:**  
   To compile your modified version into an executable, run:
   ```bash
   yarn app:dist
   ```

Below is an example of the `package.json` file used for building the app with Electron:

```json
{
  "name": "blocksmctracker",
  "version": "1.0.0",
  "main": "server.js",
  "scripts": {
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "electron .",
    "serve": "node server.js",
    "app:dir": "electron-builder --dir",
    "app:dist": "electron-builder",
    "postinstall": "electron-builder install-app-deps"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "dependencies": {
    "express": "^4.21.2",
    "minecraft-api": "^0.0.3",
    "mineflayer": "^4.26.0",
    "mojang-api": "^0.0.2",
    "socket.io": "^4.8.1"
  },
  "devDependencies": {
    "electron": "^34.2.0",
    "electron-builder": "^25.1.8"
  },
  "build": {
    "appId": "com.blocksmctracker.app",
    "productName": "BlocksMC Tracker",
    "files": [
      "server.js",
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

- **Change Port:**  
  Modify the `PORT` variable in `server.js` or use an environment variable:
  ```bash
  PORT=8080 node server.js
  ```

- **Cookies:**  
  Session cookies are stored locally in your browser. Clear them via browser settings if needed.

---

## Online Version

Test the tracker without installing anything by visiting:  
[**BlocksMC Tracker Online**](https://blocksmctracker.onrender.com/)

---

## Privacy

- Cookies are stored **only on your local device** for session persistence.
- No user information is transmitted to external servers.
- Only the player's username is sent to the server to verify ban status.

---

## Troubleshooting

- **Port Conflict:**  
  If `localhost:5052` is unavailable, change the port in `server.js`.

- **Installation Errors:**  
  Verify that **Node.js** and **npm** are installed correctly by running `node -v` and `npm -v`.

- **Termux Issues:**  
  For Android users attempting to use Termux, note that Electron is not supported. Use the provided APK instead. Also, update packages with:
  ```bash
  pkg update
  ```

---

## Disclaimer

This project is **not affiliated** with BlocksMC. Use it responsibly and in compliance with BlocksMC's terms of service.

**⭐ Star this repo if you find it useful!**  
Report issues at [GitHub Issues](https://github.com/ForgedSengoku/BlocksMCTracker/issues).
