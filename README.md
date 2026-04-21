# 🗡️ Ashen War Lite

**Idle Loot Dungeon Crawler RPG** — Browser-based, auto-battler with cloud saves, leaderboards, and Supabase persistence.

A lightweight, addictive dungeon crawler where you swear your **Oath of Ashen War**, battle through endless rooms, loot legendary gear, and climb the global leaderboard.

**Live Demo:** [rpg.crashoutcrypto.xyz/game](https://rpg.crashoutcrypto.xyz/game)

---

## ✨ Features

- **3 Unique Classes** — Mage, Warrior, Rogue (each with distinct stats and playstyle)
- **Fully Idle Combat** — Auto-progress through rooms + boss fights every 5 rooms
- **Deep Loot System** — Random gear drops, equip or sell for gold
- **Merchant & Potions** — Buy/sell items and consumables mid-run
- **Cloud Saves** — Pick up exactly where you left off from any device
- **Global Leaderboard** — Compete for the highest room reached
- **One-click Run Submission** — Submit your best run to the leaderboard instantly
- **Responsive & Mobile Friendly** — Works great on desktop or phone

Built as a fast, fun prototype that’s easy to extend with new classes, spells, prestige systems, or even crypto/NFT rewards.

---

## 🛠️ Tech Stack

- **Frontend:** Vanilla HTML + Tailwind CSS + JavaScript (`static/app.js`)
- **Backend:** Flask (Python)
- **Database:** Supabase (PostgreSQL + JSONB for game state)
- **Deployment:** Vercel (recommended) or any Flask host
- **Game Engine:** Clean, modular Python logic in `/game/`

---

## 🚀 Quick Start (Local Development)

### 1. Clone the repo
```bash
git clone https://github.com/GrandJiraiya/Ashen-War-Lite.git
cd Ashen-War-Lite
