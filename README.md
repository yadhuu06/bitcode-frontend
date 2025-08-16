# **BitCode**  
A real-time competitive coding battle platform built with **Django**, **React**, and **WebSockets**.

---

## 🚀 Overview  
**BitCode** is a dynamic, scalable platform designed for real-time competitive programming. Users can join lobbies, engage in head-to-head coding battles, and receive instant feedback on their solutions through a sleek, responsive interface.  

The platform prioritizes **speed**, **reliability**, and an **engaging user experience**, making it ideal for coders to test and sharpen their skills in a live environment.

---

# BitWar-front-end
## ✨ Features  

- 🔴 **Real-Time Coding Battles** — Compete head-to-head with other coders in a live environment.  
- ⚡ **Instant Code Evaluation** — Integrated with Judge0 API for fast, accurate code execution and feedback.  
- 🧑‍🤝‍🧑 **Lobby System** — Create or join rooms, invite friends, and challenge others.  
- 📊 **Live Leaderboard & Ranking Modes** — Track scores and rankings in real-time across various battle modes.  
- ⏳ **Timed Casual Modes** — Participate in timed challenges to test your speed and accuracy.  
- 👥 **Multiple Battle Modes** — Play 1 vs 1 duels, 5-member squads, or 10-team battles for varied competition.  
- 💬 **In-Game Chat** — Communicate with participants during battles.  
- 🔒 **Secure Authentication** — Supports email and Google OAuth login.  
- 📱 **Responsive UI** — Optimized for seamless use on desktop and mobile devices.  
- 🖼️ **Media Storage via ImageKit** — Efficient image hosting and CDN delivery for user profile pictures and media assets.  

---

## 🛠️ Tech Stack  

### **Frontend**  
- **React.js** — Component-based UI for a modular and dynamic interface.  
- **Redux** — Centralized state management for predictable data flow.  
- **Tailwind CSS / Custom Styling** — Responsive and modern UI design.  
- **WebSockets** — Real-time communication for live updates and interactions.  

### **Backend**  
- **Django + Django Channels** — Robust backend with WebSocket support for real-time features.  
- **Redis** — Message broker for WebSocket connections and caching.  
- **PostgreSQL** — Reliable relational database for data persistence.  
- **Judge0 API** — Fast and secure code execution and evaluation.  
- **ImageKit** — Cloud-based image hosting, optimization, and CDN delivery.  

---

## Live on 
[bitcode.live ](https://www.bitcode.live/)

⚙️ Environment Variables
# API URLs
VITE_API_BASE_URL=http://127.0.0.1:8000
VITE_FRONTEND_BASE_URL=http://localhost:5173

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Judge0 API
VITE_JUDGE0_API_URL=https://compile.bitcode.live

# ImageKit Configuration
VITE_IMAGEKIT_PUBLIC_KEY=your_public_key
VITE_IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_endpoint_id
VITE_IMAGEKIT_PRIVATE_KEY=your_private_key
