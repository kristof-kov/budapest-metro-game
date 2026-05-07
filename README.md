# Budapest Metrói 🚇

A single-player browser game based on [Next Station: London](https://www.boardgamegeek.com/boardgame/353545/next-station-london), set in Budapest. Build four metro lines, connect districts, cross the Danube, hit train stations and get points.

🎮 **[Play it live](https://kristof-kov.github.io/budapest-metro-game/)**

---

## How to play

1. Enter your name on the main menu and click **Játék indítása**.
2. Each of the four rounds builds one metro line (M1–M4) in a random order.
3. Click **Új kártya** to flip a card from the deck.
4. Click the current endpoint on the board, then click a matching station to draw a segment.
5. Drawing is always optional. You can skip a card by clicking **Új kártya** again.
6. A round ends when five cards of the same platform type have been drawn.

### Segment rules
- Horizontal, vertical, or 45° diagonal only
- Cannot cross another segment except at a shared station
- A line cannot visit the same station twice
- **Deák Ferenc tér** (marked `?`) accepts any card type

### Card types
 
Each round uses a deck of 11 cards:
 
| Card | Effect |
|------|--------|
| A, B, C, D | Draw a segment to a station with the matching letter |
| Joker | Draw a segment to any station |
| Váltó (Switch) | Automatically draws a second card: lets you start the next segment from any already-visited station |
 
Cards also have a **platform type**: inner platform (középső peron) or outer platform (szélső peron). Once five cards of either type have been drawn, the round ends after that segment.

## Scoring

### Each round — Round Points (FP)
| Symbol | Rule |
|--------|------|
| PK | Number of districts touched by the line |
| PM | Most stops in a single district |
| PD | Number of Danube crossings |
| **FP** | **(PK × PM) + PD** |
 
### End of game
| Bonus | Rule |
|-------|------|
| Train stations | Slider: 0 → 1 → 2 → 4 → 6 → 8 → 11 → 14 → 17 → 21 → 25 |
| 2-line junction | 2 pts each |
| 3-line junction | 5 pts each |
| 4-line junction | 9 pts each |
| **Final score** | FP1 + FP2 + FP3 + FP4 + station slider + junction points |

## Project structure
 
```
├── index.html          # Main menu
├── game.html           # Game board
├── css/
│   ├── index.css
│   └── game.css
├── js/
│   ├── main.js         # Entry point: round/game flow
│   ├── state.js        # Central game state and station data
│   ├── board.js        # Table generation and click handling
│   ├── segment.js      # Segment validation and SVG drawing
│   ├── Deck.js         # Card deck management
│   ├── Scorer.js       # Round and final score calculation
│   ├── ui.js           # All DOM reads/writes
│   ├── leaderboard.js  # localStorage leaderboard
│   └── index.js        # Menu logic
├── assets/             # SVG station icons, metro line markers, UI icons
└── data/               # stations.json, lines.json
```

## Running locally

No build step needed, it's plain HTML, CSS and ES modules.

```bash
# Option 1: VS Code Live Server extension (recommended)
# Open index.html → right-click → "Open with Live Server"
 
# Option 2: Python
python -m http.server 8080
# then open http://localhost:8080
 
# Option 3: Node
npx serve .
```

> ⚠️ ES modules require a server — opening `index.html` directly via `file://` won't work.

## Tech stack
 
- Vanilla JavaScript (ES modules, no framework)
- SVG overlay for segment drawing
- `localStorage` for the leaderboard