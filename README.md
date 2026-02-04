# Ski Weather Finder ⛷️❄️

A modern Chrome extension that helps you find the best ski conditions near you (or anywhere in the world). It identifies nearby ski resorts and ranks them based on real-time weather, snow depth, and fresh snowfall.

## Features

- **📍 Nearby Discovery**: Automatically finds resorts within your vicinity (100km, 500km, or global fallback).
- **🔍 Manual Search**: Search for any city (e.g., "Geneva", "Denver") to find the best slopes in that region.
- **📊 Smart Ranking**: A ranking engine that weights conditions based on:
  - **Sunshine**: Higher priority for clear/sunny skies.
  - **Fresh Snow**: Bonus for recent snowfall.
  - **Ski Lifts**: Prioritizes larger resorts (min 10 lifts).
  - **Base Depth**: Ensures solid skiing conditions.
- **📈 Advanced Sorting**: Sort results by "Best Conditions", "Snow Depth", or "Number of Lifts".
- **🔗 Resort Links**: Click on a resort name to visit its official website directly.
- **⚡ Performance**: Local caching for the global ski database (over 5,000 resorts) ensures instant loading.
- **🎨 Minimal Design**: A clean, "flat" UI with essential weather markers and glassmorphic touches.

## Tech Stack

- **Framework**: React + Vite
- **Language**: TypeScript
- **Styling**: Vanilla CSS
- **APIs**:
  - [Open-Meteo Weather API](https://open-meteo.com/en/docs) (Weather & Snow)
  - [Open-Meteo Geocoding API](https://open-meteo.com/en/docs/geocoding-api) (Location search)
  - [OpenSkiMap](https://openskimap.org/) (Global resort database)
- **Icons**: Lucide React

## Installation

1.  **Clone the repository**:
    ```bash
    git clone [repository-url]
    cd PowderScout
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Build the project**:
    ```bash
    npm run build
    ```
4.  **Load in Chrome**:
    - Open Chrome and navigate to `chrome://extensions`.
    - Enable **Developer mode** (top right).
    - Click **Load unpacked** and select the `dist` folder in the project directory.

## License

MIT
