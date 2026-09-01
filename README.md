# 🛡️ ClaimSync

**AI-powered warranty, claim & subscription intelligence — for everything you own.**

ClaimSync is a full-stack web app that turns a photo of a receipt into a tracked, protected asset. It watches your warranties so you don't have to, drafts your claim letters when something breaks, and keeps your recurring subscriptions from quietly draining your wallet.

Built with **React + TypeScript + Tailwind CSS** on the frontend, **Express** on the backend, and powered by the **Gemini API** for intelligent document understanding and an in-app AI copilot.

---

## ✨ Features

### 📸 Snap HUD & Receipt Scanner
Capture a receipt with your camera or upload a file (PDF/JPG/PNG). Gemini-powered OCR auto-extracts:
- Product name & brand
- Store / retailer
- Serial number
- Price & purchase date
- Statutory warranty duration

For added reliability, ClaimSync also uses **Tesseract OCR** as a scanning layer for bills, giving the extraction pipeline a fast, offline-capable fallback alongside Gemini's vision-based parsing.

### 🗄️ Warranties Vault
A living dashboard of everything you've protected:
- Lifecycle status tracking — **Active, Expiring Soon, Critical (≤7 days), Expired, Estimated**
- Real-time days-remaining counters
- Search, filter, and sort across your entire vault
- Invoice/receipt attachments per item
- **Money-at-risk** calculations so you know exactly what's on the line

### 📝 Auto-Claims Engine
When something goes wrong, ClaimSync writes the claim for you:
- Formal, legally referenced warranty claim letters and emails
- Auto-populated brand contact details
- AI-generated defect analysis
- Customizable tone (formal, firm, friendly, etc.)
- Recommended evidence checklist to strengthen your claim

### 🔁 Subscriptions Hub
Take control of recurring spend:
- Track every active subscription in one place
- Monthly & annual spend breakdowns
- Next billing date tracking with renewal countdowns
- One-click, step-by-step cancellation guides

### 📊 Savings & Analytics
See the ROI of staying organized:
- Money saved via successful claims & repairs
- Total protected portfolio value
- Trends over time

### 🤖 In-App AI Copilot (Gemini)
A floating, context-aware assistant that:
- Answers how-to questions about the app
- Reads your live stats to give personalized answers
- Performs one-click in-app navigation and actions
- Includes fallback resilience if the AI service is unavailable

### 🎨 Visual System
- 6 switchable atmospheric color themes
- Synchronized UI controls across the app
- Subtle micro-animations for a polished feel

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, TypeScript, Tailwind CSS |
| Backend | Express (Node.js) |
| AI / OCR | Gemini API, Tesseract OCR |
| File handling | PDF / JPG / PNG upload & camera capture |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn
- A Gemini API key

### Installation

```bash
# Clone the repo
git clone https://github.com/<your-username>/claimsync.git
cd claimsync

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Add your GEMINI_API_KEY and other config values

# Run the development server
npm run dev
```

The app should now be running at `http://localhost:3000` (or your configured port).

---

## 📂 Project Structure

```
claimsync/
├── client/          # React + TypeScript + Tailwind frontend
├── server/          # Express backend
├── shared/          # Shared types/utils
├── .env.example
└── README.md
```

*(Adjust to match your actual repo layout.)*

---

## 🗺️ Roadmap
- [ ] Mobile app (React Native)
- [ ] Multi-currency support
- [ ] Shared/family vaults
- [ ] Push notifications for expiring warranties & renewals

---

## 🤝 Contributing
Contributions, issues, and feature requests are welcome. Feel free to open an issue or submit a PR.

## 📄 License
[MIT](LICENSE) — or update to match your chosen license.
