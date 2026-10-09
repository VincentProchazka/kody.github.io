# 🏎️ ShiftLog | Personal Garage & Vehicle Maintenance Tracker

[![Deploy to GitHub Pages](https://github.com/VincentProchazka/kody.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/VincentProchazka/kody.github.io/actions/workflows/deploy.yml)

A high-tech automotive telemetry cockpit and personal vehicle maintenance tracker built with React, Tailwind CSS, LocalStorage persistence, and Web Audio API acoustics.

🔗 **Live GitHub Pages URL:** [https://vincentprochazka.github.io/kody.github.io/](https://vincentprochazka.github.io/kody.github.io/)

---

## ⚡ Features

- **Automotive Cockpit UI**: Sleek dark carbon palette with Racing Red, Electric Blue, and Neon Green accents.
- **Physical Neumorphic Gauges**:
  - Fuel Level Dial with needle sweep & range estimation (~584 km).
  - Oil Health Monitor with service countdown (84% healthy, 8,350 km remaining).
  - Brake System Health (92% optimal thickness).
- **Digital Rolling Odometer**: Segmented cluster bezel showing `142,850 km`.
- **4-Wheel TPMS Realtime Monitor**: Live chassis telemetry (Front 2.2 bar, Rear 2.1 bar, individual temperatures & status).
- **Maintenance Log & Timeline**: Verified history with full CRUD, category filtering, and instant search.
- **Telemetry Analytics**: Interactive 6-month curves with hover tooltips (`L/100km Trend` vs `Total Spend (€)`).
- **Web Audio Acoustics**: Engine rev sounds, tactile switch clicks, and harmonic celebration chimes.
- **Local-First**: Persists data to LocalStorage with JSON export/import & demo reset capabilities.

---

## 🚀 Running Locally

Open `index.html` in any modern web browser or run:

```bash
python -m http.server 5173
```
Then visit `http://localhost:5173`.
