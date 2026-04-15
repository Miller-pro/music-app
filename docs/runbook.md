# AudioVerse Runbook

Step-by-step instructions for setting up, running, building, deploying, and troubleshooting the app.

---

## Prerequisites

You need the following installed on your machine:

- **Node.js** version 18 or higher (check with `node --version`)
- **npm** version 9 or higher (comes with Node.js, check with `npm --version`)
- **Git** for version control

---

## Getting Started

1. Clone the repository to your machine.
2. Open a terminal and navigate to the project folder.
3. Install dependencies:
   ```
   npm install
   ```
4. Start the development server:
   ```
   npm run dev
   ```
5. Open your browser and go to the URL shown in the terminal (usually http://localhost:5173).

---

## Available Commands

| Command           | What It Does                                              |
|-------------------|-----------------------------------------------------------|
| `npm run dev`     | Starts the development server with hot reload.            |
| `npm run build`   | Builds the app for production into the `dist` folder.     |
| `npm run preview` | Serves the production build locally so you can test it.   |

---

## Project Structure

- **src/** contains all the application code (components, pages, hooks, services, context, config, data, and utilities).
- **public/** contains static files like the sitemap and robots.txt.
- **dist/** is the production build output. Do not edit files in here directly.
- **scripts/** contains Node.js scripts for scraping radio stations and music from external sources.
- **docs/** contains project documentation.

---

## Configuration

### App Settings

The main app settings are in `src/config/config.js`. This is where you change:

- Branding (app name, logo, colors)
- Feature toggles (downloads, playlists, queue, search, shuffle, repeat, animations, keyboard shortcuts)
- Music source settings (catalog file path, items per page, search debounce time)
- Available genres, moods, and use cases
- Player defaults (starting volume, crossfade duration)

### Ad Settings

Ad configuration lives in `src/config/adConfig.js`. This is where you change:

- The master on/off switch for ads (`adsEnabled`)
- Which ad provider to use (custom, adsense, mediavine, admanager)
- Banner ad sizes and refresh intervals
- How often in-feed ads appear (default: every 10 songs)
- How often pre-roll ads play (default: every 4 songs)
- Skip timer length for pre-roll ads (default: 5 seconds)

Ads are turned off by default. Set `adsEnabled` to `true` when you are ready to start showing ads.

### Music Catalog

The music catalog is stored in `src/data/catalog.json`. It contains all tracks, curated playlists, and radio stations. To add new content, you can either edit this file directly or use the scraping scripts.

---

## Scraping Scripts

These scripts pull content from external sources and add it to the catalog.

### Fetch Radio Stations

```
node scripts/scrape_radio.mjs
```

This script connects to the Radio-Browser API and fetches live radio stations. It filters by genre, country (US, GB, FR, DE, IL, CA), minimum bitrate (64kbps), and minimum votes (10+). It tests each stream URL to make sure it works, then merges the results into the catalog.

### Fetch Music from Archive.org

```
node scripts/scrape_archive.mjs
```

This script pulls audio files from the Internet Archive, extracts metadata, and adds them to the catalog.

### Fetch Commercially Safe Music

```
node scripts/scrape_commercial_safe.mjs
```

This script finds music that is safe for commercial use, validates the licensing, and adds genre, mood, and use case tags.

---

## Building for Production

1. Run the build command:
   ```
   npm run build
   ```
2. The output goes into the `dist` folder.
3. To test the production build locally:
   ```
   npm run preview
   ```
4. Open the URL shown in the terminal to verify everything works.

---

## Deploying to Vercel

The app is set up for Vercel deployment. The `vercel.json` file rewrites all routes to `index.html` so the single-page app routing works correctly.

### First-Time Setup

1. Install the Vercel CLI: `npm install -g vercel`
2. Run `vercel` in the project folder and follow the prompts to link the project.
3. Push to the linked Git repository. Vercel will build and deploy automatically.

### Manual Deploy

Run `vercel --prod` to deploy directly from your machine.

### What Happens on Deploy

- Vercel runs `npm run build` automatically.
- The `dist` folder is served as a static site.
- All routes are rewritten to `index.html` so page refreshes work on any route.

---

## Data Storage

All user data is stored in the browser's local storage. There is no server or database. This means:

- Data stays on the device where it was created.
- Clearing browser data wipes everything.
- There is no sync between devices.

The local storage keys used are:

| Key                              | What It Stores                    |
|----------------------------------|-----------------------------------|
| `audioverse_playlists`           | User-created playlists            |
| `audioverse_history`             | Recently played tracks (max 100)  |
| `audioverse_downloads`           | Download history                  |
| `audioverse_volume`              | Volume level                      |
| `audioverse_liked`               | Liked track IDs                   |
| `audioverse_sidebar_collapsed`   | Whether the sidebar is collapsed  |

---

## Troubleshooting

### The dev server won't start

- Make sure you ran `npm install` first.
- Check that Node.js 18+ is installed.
- Delete `node_modules` and `package-lock.json`, then run `npm install` again.
- Check if another process is using port 5173. You can change the port in `vite.config.js`.

### Audio won't play

- Check the browser console for errors. The most common issue is a broken or expired stream URL.
- Some browsers block autoplay. The user must interact with the page first (click play).
- If a radio station won't play, the stream might be down. Try a different station.
- Check that the track URL in the catalog is correct and accessible.

### The build fails

- Read the error message in the terminal. Vite will tell you which file and line has the problem.
- Make sure all imports point to files that exist.
- Run `npm run dev` first to check for errors in development mode, where error messages are more detailed.

### Styles look wrong

- Make sure Tailwind CSS is installed and the Vite plugin is configured in `vite.config.js`.
- Clear the browser cache or do a hard refresh.
- Check that `index.css` is imported in `main.jsx`.

### Pages show a 404 on refresh (in production)

- This means the server is not rewriting routes to `index.html`.
- On Vercel, the `vercel.json` file handles this. Make sure it is present and has the rewrite rule.
- On other hosts, you need to configure the server to serve `index.html` for all routes.

### Local storage is full

- The browser has a limit (usually 5-10 MB) for local storage per site.
- If the play history grows too large, the app trims it to 100 entries automatically.
- Clear old download history or unused playlists if storage is tight.

---

## Useful Links

- **Vite docs**: https://vite.dev
- **React docs**: https://react.dev
- **Tailwind CSS docs**: https://tailwindcss.com
- **Framer Motion docs**: https://motion.dev
- **Vercel docs**: https://vercel.com/docs
- **Radio-Browser API**: https://www.radio-browser.info
