# ⚡ Poké-Battle Stats Lab

> Interactive web app to compare two Pokémon stats in real-time. Search by name or ID, visualize HP/Attack/Defense with animated bars, evolution chain and first 4 moves. Data from PokéAPI via XMLHttpRequest. Pure HTML, CSS and JavaScript, no dependencies.

---

## 📸 Features

- 🔍 **Search by name or ID** — type any Pokémon name or National Pokédex number to load it instantly
- ⚔️ **Side-by-side comparison** — load two Pokémon at once and compare their base stats
- 📊 **Animated stat bars** — HP, Attack and Defense displayed with color-coded bars; the winner's bar lights up in green
- 🌿 **Habitat info** — fetched from the Species endpoint and displayed under each Pokémon
- 🔗 **Evolution chain** — full chain rendered with sprites and arrows in the right-hand panel
- 🥊 **First 4 moves** — displayed in a compact two-column grid for each Pokémon
- 🎮 **Retro Pokédex UI** — pixel font, Game Boy–style green screens, and a classic red frame

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Markup | HTML5 |
| Styling | CSS3 (custom properties, CSS Grid, Flexbox) |
| Logic | Vanilla JavaScript (ES6+, async/await) |
| HTTP | XMLHttpRequest wrapped in a Promise |
| Data | [PokéAPI v2](https://pokeapi.co/) |
| Font | [Press Start 2P](https://fonts.google.com/specimen/Press+Start+2P) via Google Fonts |

No frameworks, no libraries, no build tools — just three files.

---

## 🚀 Getting Started

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/poke-battle-stats-lab.git
   cd poke-battle-stats-lab
   ```

2. **Open the app**
   ```bash
   # Option A — open directly in the browser
   open index.html

   # Option B — serve locally (recommended to avoid CORS issues)
   npx serve .
   # or
   python -m http.server 8000
   ```

3. **Use the app**
   - Type a Pokémon name (e.g. `pikachu`) or ID (e.g. `25`) in either slot
   - Click **SCAN**
   - Load a second Pokémon in the other slot to trigger the stat comparison

---

## 📁 Project Structure

```
poke-battle-stats-lab/
├── index.html   # App structure and layout
├── style.css    # All visual styles and animations
└── script.js    # API logic, rendering and stat comparison
```

---

## 🌐 API Calls

Each SCAN triggers up to **3 sequential API calls**:

1. `GET /pokemon/{name-or-id}` — base stats, sprites, moves
2. `GET /pokemon-species/{id}` — habitat and evolution chain URL
3. `GET /evolution-chain/{id}` — full evolution tree

Each evolution stage then fetches its own sprite with an additional call to `/pokemon/{name}`.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

*Data provided by [PokéAPI](https://pokeapi.co/) — free and open Pokémon data.*
