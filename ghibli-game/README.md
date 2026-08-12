# Windward Meadow

A small Studio Ghibli-inspired walking game in the browser, built with [Three.js](https://threejs.org/) r185.

You play a red-scarfed traveler in a painterly valley. Wander the hills, visit the cottage and the pond, and gather twelve forest spirits before dusk.

This is an original scene in the spirit of those films — not a licensed Ghibli property.

## Run it

You need Node.js 20.19+ (22 is fine).

```bash
cd ghibli-game
npm install
npm run dev
```

Then open the URL Vite prints (usually `http://localhost:5173`).

Production build:

```bash
npm run build
npm run preview
```

## Controls

| Input | Action |
| --- | --- |
| **W A S D** or arrows | Walk |
| **Shift** | Run |
| **Mouse** (click the valley first) | Look around |
| **Space** | Hop |
| Walk into a spirit | Collect it |

## What you will see

- Rolling green hills, wind in the grass, and a late-afternoon sky
- A cottage with a cat on the roof and smoke from the chimney
- A pond with lily pads, a great tree, and distant mountains
- Twelve glowing forest spirits to bring home
- The light slowly turning to dusk as you collect them
