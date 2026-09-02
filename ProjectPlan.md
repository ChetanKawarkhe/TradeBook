### Initial stack

* **React Native + Expo**
* **TypeScript**
* **Expo Router** for navigation
* **SQLite** for local/offline trade data
* **Google authentication** later
* **Google Drive sync** after the core app works
* Reusable theme/design system 
* Animations/transitions kept smooth and subtle

### First milestone


```text
Trading Journal
│
├── Home
│   ├── Today's P&L
│   ├── Trader Score
│   ├── Quick Stats
│   ├── P&L Calendar
│   ├── Equity Curve
│   ├── Today's Insight
│   └── Recent Trades
│
├── Trades
│   ├── Trade List
│   ├── Filters
│   └── Trade Details
│
├── Add Trade
│   ├── Manual
│   ├── Voice
│   └── Screenshot
│
├── Analytics
│   ├── Performance
│   ├── Risk
│   ├── Emotion
│   ├── Strategy
│   └── Mistakes
│
└── Journal
    ├── Daily Journal
    ├── Goals
    ├── Rules
    ├── Playbook
    └── Lessons
```
---

```text
TradingJournal/
│
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Home
│   │   ├── trades.tsx
│   │   ├── add.tsx
│   │   ├── analytics.tsx
│   │   └── journal.tsx
│   │
│   ├── trade/
│   │   └── [id].tsx
│   │
│   └── _layout.tsx
│
├── components/
│   ├── ui/
│   ├── cards/
│   ├── charts/
│   └── trade/
│
├── constants/
│   ├── colors.ts
│   ├── theme.ts
│   └── spacing.ts
│
├── data/
│
├── hooks/
│
├── services/
│   ├── database/
│   ├── google/
│   └── voice/
│
├── types/
│
└── utils/
```
