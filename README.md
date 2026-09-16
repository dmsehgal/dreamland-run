# Dreamland Run

A cozy browser platformer: design your own dreamer, then run and jump across floating islands connected by a rainbow river, collecting stars along the way.

## Play it now

**https://deepmohansehgal.com/dreamland-run/**

Just open the link — nothing to install, no account needed. Works on desktop and mobile browsers.

## How to play

1. **Design your character** — pick girl or boy, skin tone, hair color, outfit color, and add a hat and/or glasses.
2. **Choose an island** from the Rainbow River map. Islands unlock in order as you complete each one.
3. **Run and jump**:
   - Desktop: Arrow keys or `A`/`D` to move, `Space` (or `↑`/`W`) to jump.
   - Mobile/touch: use the on-screen ← → and Jump buttons.
   - Collect stars, avoid falling in the water, and reach the flag at the end of the island.
4. Finish all islands to cross the Rainbow River and see your total star count.

Your character design and island progress are saved in your browser automatically (via `localStorage`), so they'll still be there next time you open the link on the same device/browser.

## Running it locally

No build step or dependencies needed — it's plain HTML/CSS/JS.

```bash
git clone https://github.com/dmsehgal/dreamland-run.git
cd dreamland-run
python3 -m http.server 8000
```

Then open `http://localhost:8000` in your browser. (Or just double-click `index.html` — it works without a server too.)

## Tech

Static site: `index.html`, `style.css`, `game.js`. Character art and gameplay are drawn on an HTML5 `<canvas>` with no external assets, frameworks, or libraries.
