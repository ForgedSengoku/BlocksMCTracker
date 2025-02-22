
---
# BlocksMC Tracker

BlocksMC Tracker is a **Node.js** server application designed to monitor and track **player ban statuses** on BlocksMC in real-time. It features a sleek interface and can be easily hosted locally, even on mobile devices using **Termux**. A **desktop version** is now available for easier setup and use.

> Note: The website version has been discontinued for a simpler setup and now has moved to electron.

---

## Features

- **Real-Time Ban Monitoring** – Instantly check if a player is banned or unbanned on BlocksMC.
- **Mobile-Friendly** – Runs on Termux, allowing you to host the tracker directly from your Android device.
- **Stylish Interface** – Clean and modern design for a seamless user experience.
- **Pink Theme** – A sleek pink-colored UI for a fresh look.
- **Erase All Player Usernames** – Useful for clearing space and freeing up storage when tracking thousands of usernames.
- **Lightweight** – Doesn’t require many resources since it’s only a ban checker tool.
- **Local Hosting** – Defaults to `localhost:5052` for quick setup and testing.
- **Automatic Updates** – Continuously refreshes player status without manual intervention.
- **Cookie Storage** – Stores cookies locally for session persistence (no external databases required).
- **Desktop Version Available** – An easy-to-install version for Windows, macOS, and Linux users.

---

## Prerequisites

- **Node.js** (v22 or higher) – Required due to Mineflayer package conflicts.
- **npm** (Node Package Manager)
- **Termux** (for Android users)
- **Basic command-line knowledge**

---

## Installation & Usage

### Desktop Version (Easier Setup)

The **desktop version** of the tracker is available for straightforward installation. Download the latest release from [GitHub Releases](https://github.com/ForgedSengoku/BlocksMCTracker/releases) and run the executable for your operating system.

### Mobile (Termux) Setup

1. **Install Node.js:**  
   Open Termux and type:
   ```bash
   pkg install node-lts
   ```

2. **Choose a Folder:**  
   Navigate to your desired folder, for example:
   ```bash
   cd /storage/emulated/0/YourFolder
   ```

3. **Clone the Repository:**  
   ```bash
   git clone https://github.com/ForgedSengoku/BlocksMCTracker.git
   cd BlocksMCTracker
   ```

4. **Install Dependencies:**  
   ```bash
   npm install mineflayer express socket.io mojang-api
   ```

5. **Start the Server:**  
   ```bash
   node server.js
   ```

6. **Access the Tracker:**  
   Open your browser and navigate to `http://localhost:5052`.

### PC Setup

1. **Download Node.js:**  
   Visit [https://nodejs.org/](https://nodejs.org/) and download the **LTS (Long Term Support)** version.

2. **Clone the Repository:**  
   Open a terminal (or Command Prompt) and run:
   ```bash
   git clone https://github.com/ForgedSengoku/BlocksMCTracker.git
   cd BlocksMCTracker
   ```

3. **Install Dependencies:**  
   ```bash
   npm install
   ```

4. **Start the Server:**  
   ```bash
   node server.js
   ```

5. **Access the Tracker:**  
   Open your browser and navigate to `http://localhost:5052`.

**Why It Works on a Phone:**  
Android devices share similarities with ARM64 laptops, and Node.js supports ARM. This allows you to run Node.js applications like this ban checker directly on your phone.

---

## Compiling, Forking, and Modifying

If you wish to fork, modify, or compile the project further, follow these steps:

1. **Fork the Repository:**  
   Click the "Fork" button on GitHub to create your own copy of the project.

2. **Clone Your Fork:**  
   ```bash
   git clone https://github.com/yourusername/BlocksMCTracker.git
   cd BlocksMCTracker
   ```

3. **Install Development Dependencies:**  
   For projects using Node.js in a similar fashion to Electron, add Electron as a development dependency:
   ```bash
   npm install electron --save-dev
   ```

4. **Make Your Modifications:**  
   Update the code, add features, or change configurations as desired. Changes will take effect after restarting the server.

5. **Compile or Run Your Version:**  
   Run the server using:
   ```bash
   node server.js
   ```
   For Electron-based builds, ensure your main file points to the correct Electron entry point.

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
  Grant storage permissions and update packages with:
  ```bash
  pkg update
  ```

---

## Disclaimer

This project is **not affiliated** with BlocksMC. Use it responsibly and in compliance with BlocksMC's terms of service.

**⭐ Star this repo if you find it useful!**  
Report issues at [GitHub Issues](https://github.com/ForgedSengoku/BlocksMCTracker/issues).
