# BlocksMC Tracker

BlocksMC Tracker is a Node.js server application designed to monitor and track player ban statuses on BlocksMC in real-time. It features a sleek interface and can be easily hosted locally, even on mobile devices using Termux.


## Features

- **Real-Time Ban Monitoring:** Instantly check if a player is banned or unbanned on BlocksMC.
- **Mobile-Friendly:** Runs on Termux, allowing you to host the tracker directly from your Android device.
- **Stylish Interface:** Clean and modern design for seamless user experience.
- **Local Hosting:** Defaults to `localhost:5052` for quick setup and testing.
- **Automatic Updates:** Continuously refreshes player status without manual intervention.
- **Cookie Storage:** Stores cookies locally for session persistence (no external databases required).

## Prerequisites

- Node.js (v22 or higher) (Must be 22 becuase of mineflayer package having confilcts)
- npm (Node Package Manager)
- Termux (for Android users)
- Basic command-line knowledge

---

## Installation & Usage

### **Step 1: Clone the Repository**
```bash
git clone https://github.com/your-username/BlocksMCTracker.git
cd BlocksMCTracker
```

### **Step 2: Install Dependencies**
```bash
npm install
```

### **Step 3: Start the Server**
```bash
node server.js
```
The server will start at `http://localhost:5052` by default.

---

## **Running on Mobile (Termux)**
1. Install [Termux](https://termux.com/) from F-Droid or the Play Store.
2. Follow the same installation steps above within Termux.
3. Allow Termux to access storage if prompted.
4. Access the tracker via your phone's browser at `http://localhost:5052`.

---

## How to Use
1. Open your browser and navigate to `http://localhost:5052`.
2. Enter the Minecraft username of the player you want to check.
3. View real-time ban status updates directly on the dashboard.

---

## Configuration
- **Change Port:** Modify the `PORT` variable in `server.js` or use environment variables:
  ```bash
  PORT=8080 node server.js
  ```
- **Cookies:** Session cookies are stored locally in your browser. Clear them via browser settings if needed.

---

## Privacy
- This tool stores cookies **only on your local device** to maintain session data.
- No user information is transmitted to external servers.

---

## Troubleshooting
- **Port Conflict:** If `localhost:5052` is unavailable, change the port in `server.js`.
- **Installation Errors:** Ensure Node.js and npm are correctly installed. Use `node -v` and `npm -v` to verify.
- **Termux Issues:** Grant storage permissions and update packages with `pkg update`.

---

## Disclaimer
This project is not affiliated with BlocksMC. Use it responsibly and in compliance with BlocksMC's terms of service.

---

**Star this repo if you find it useful!** ⭐  
Report issues [here](https://github.com/ForgedSengoku/BlocksMCTracker/issues).
