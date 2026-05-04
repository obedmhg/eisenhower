# Eisenhower Matrix App

[Live Demo ➔](https://eisenhowermx.netlify.app/)

This is a modern web application to help you create and manage **Eisenhower Matrices** — a powerful tool to organize tasks based on urgency and importance. Your matrices are saved locally in your browser and are fully under your control.

---

![Vite](https://img.shields.io/badge/Vite-5.4.2-blueviolet?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-18.3.1-61dafb?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue?logo=typescript&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.1-38b2ac?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- **Create**, **update**, and **delete** multiple matrices
- **Drag and drop** tasks between quadrants
- **Edit** tasks quickly and intuitively
- **Export** matrix content to your clipboard
- **Persistent storage** via browser `localStorage`
- **Responsive design** with smooth interactions

## 🚀 Tech Stack

- **React 18** with **Vite**
- **TypeScript**
- **TailwindCSS** for styling
- **React DnD** for drag-and-drop
- **Lucide React** for icons
- **ESLint** + **TypeScript ESLint** for linting
- Hosted on **Netlify**
- **Posthog** for analytics

## 📦 Local Storage

All matrices are stored locally on your device using `localStorage`.  
No server, no accounts, no cloud – 100% private.

⚠️ **Note:** If you clear your browser storage, your matrices will be lost.

## 📋 Export Example

When exporting your matrix, you'll get a clean, formatted text output like this:

### 🛑 Urgent & Important
	•	Submit project report
	•	Pay electricity bill

### 🕰 Not Urgent & Important
	•	Schedule health checkup
	•	Plan vacation

### 🔥 Urgent & Not Important
	•	Respond to Slack messages

### 💤 Not Urgent & Not Important
	•	Watch new Netflix series


 ## 🛠 Development

If you want to run the project locally:

```bash
git clone https://github.com/obedmhg/eisenhower.git
cd eisenhower
pnpm install
pnpm dev
```


## 📋 Available scripts

		pnpm dev — Start local development server
		pnpm build — Build production-ready app
		pnpm preview — Preview the production build locally
		pnpm lint — Run ESLint on the project

## 📢 Notes

	Fully optimized for desktop browsers.
	Offline-ready after first load.
	Mobile experience is functional but best on larger screens.


Made with ❤️ using bolt.new
