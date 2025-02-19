
# BlocksMC Tracker  

BlocksMC Tracker is a **Node.js** server application designed to monitor and track **player ban statuses** on BlocksMC in real-time. It features a sleek interface and can be easily hosted locally, even on mobile devices using **Termux**.

---

## Features  

- **Real-Time Ban Monitoring** – Instantly check if a player is banned or unbanned on BlocksMC.  
- **Mobile-Friendly** – Runs on Termux, allowing you to host the tracker directly from your Android device.  
- **Stylish Interface** – Clean and modern design for a seamless user experience.  
- **Pink Theme** – A sleek pink-colored UI for a fresh look.  
- **Erase All Player Usernames** – Useful for clearing space and freeing up storage if tracking thousands of usernames.  
- **Lightweight** – Doesn’t require many resources since it’s only a ban checker tool.  
- **Local Hosting** – Defaults to `localhost:5052` for quick setup and testing.  
- **Automatic Updates** – Continuously refreshes player status without manual intervention.  
- **Cookie Storage** – Stores cookies locally for session persistence (no external databases required).

---

## Prerequisites  

- **Node.js** (v22 or higher) – Required due to Mineflayer package conflicts.  
- **npm** (Node Package Manager)  
- **Termux** (for Android users)  
- **Basic command-line knowledge**

---

## Installation & Usage  

### Step 1: Clone the Repository  
```bash
git clone https://github.com/ForgedSengoku/BlocksMCTracker.git
cd BlocksMCTracker
```  

### Step 2: Install Dependencies  
```bash
npm install mineflayer express socket.io mojang-api
```  

### Step 3: Start the Server  
```bash
node server.js
```  
The server will start at `http://localhost:5052` by default.

---

## Getting Started on Mobile (Termux)  

1. **Install Node.js:**  
   Open Termux and type:  
   ```bash
   pkg install node-lts
   ```  

2. **Choose a Folder:**  
   To store the tracker files, navigate to your desired folder. For example:  
   ```bash
   cd /storage/emulated/0/YourFolder
   ```  
   *Alternatively, if you prefer using Termux’s home directory, use a file manager (like Material Files) to navigate to `Android/data/com.termux` and manage your files there.*

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
   Open your phone’s browser and go to `http://localhost:5052`.

---

## Getting Started on PC  

1. **Download Node.js:**  
   Visit [https://nodejs.org/](https://nodejs.org/) and download the **LTS (Long Term Support)** version. This version is stable and works on ARM64 laptops as well as standard PCs.

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
Android devices share similarities with ARM64 laptops in terms of architecture, and Node.js supports ARM. This allows you to run Node.js applications like this ban checker tool directly on your phone.

---

## Configuration  

- **Change Port:**  
  Modify the `PORT` variable in `server.js` or use environment variables:  
  ```bash
  PORT=8080 node server.js
  ```  

- **Cookies:**  
  Session cookies are stored locally in your browser. Clear them via browser settings if needed.

---

## Online Version  

If you want to test the tracker without installing anything, visit:  
[**BlocksMC Tracker Online**](https://blocksmctracker.onrender.com/)

---

## Privacy  

- This tool stores cookies **only on your local device** to maintain session data.  
- No user information is transmitted to external servers.  
- The only data transmitted is the **player's username** to the server to log in and check their ban status.

---

## Troubleshooting  

- **Port Conflict:**  
  If `localhost:5052` is unavailable, change the port in `server.js`.

- **Installation Errors:**  
  Ensure **Node.js** and **npm** are correctly installed. Use `node -v` and `npm -v` to verify.

- **Termux Issues:**  
  Grant storage permissions and update packages with:  
  ```bash
  pkg update
  ```

---

## Disclaimer  

This project is **not affiliated** with BlocksMC. Use it responsibly and in compliance with BlocksMC's terms of service.

---

**⭐ Star this repo if you find it useful!**  
Report issues [here](https://github.com/ForgedSengoku/BlocksMCTracker/issues).

