# AudioVerse Changelog

All notable changes to the project are listed here, starting with the most recent.

---

## Version 1.0.0 - Initial Release (January 2026)

### Music Player
- Built a full music player with play, pause, skip forward, skip back, and seek controls.
- Added volume control with a mute toggle.
- Added shuffle mode that randomizes the play order.
- Added three repeat modes: off, repeat all, and repeat one.
- Added a live progress bar that updates as the track plays, with time tooltips on hover.
- Added keyboard shortcuts: Space to play/pause, Shift+Arrow keys to skip tracks, Arrow keys to seek, M to mute, S for shuffle, R for repeat.
- Built touch-friendly seek and volume controls for mobile devices.

### Music Discovery
- Created a Home page with a hero section, platform stats, value propositions, featured collections, and a live radio preview.
- Created a Browse page with curated playlists, trending tracks, most downloaded tracks, mood filters, and use case categories.
- Created a Library page with advanced search, filtering by genre, mood, and use case, sorting options (popular, recent, downloads, A-Z), and a toggle between grid and list views.

### Live Radio
- Added a Radio page with 50+ live radio stations.
- Stations can be filtered by genre (jazz, classical, blues, ambient, world, folk, electronic) and by country.
- Added search to find stations by name.
- Stations show a live indicator when playing.

### User Library
- Users can create, rename, and delete playlists.
- Users can add tracks to playlists, remove them, and reorder them.
- Added a liked tracks feature with a heart button on each track.
- Added a play queue with the ability to add, remove, and view upcoming tracks.
- Play history is saved automatically (up to 100 tracks).
- Download history tracks which songs the user has downloaded.

### Advertising Platform
- Built a publisher section with banner ad slots (300x250, 728x90, 320x50), in-feed sponsored content, and pre-roll video ads with a skip timer.
- Added a revenue calculator for publishers.
- Added an SDK integration guide and an ads.txt generator.
- Added a publisher signup form using EmailJS.
- Built an advertiser demo page with six interactive ad format demos: Standard, Immersive, In-Game, Contextual, Mid-Roll, and Companion Banner.
- Added performance metrics display (CPM, completion rates, click-through rates).
- All ads are disabled by default behind a master switch in the config.

### Data and Content
- Loaded a music catalog with tracks sourced from archive.org, Musopen, and other copyright-free sources.
- Each track includes title, artist, album, genre, mood, use case tags, duration, play count, download count, license info, and cover art.
- Tracks cover genres: classical, jazz, ambient, electronic, acoustic, world, folk, and cinematic.
- Moods include energetic, calm, happy, melancholic, inspiring, dark, romantic, peaceful, epic, and playful.
- Use cases include YouTube, podcasts, work, gaming, meditation, and fitness.

### Design and User Experience
- Dark theme with a navy background and glassmorphism effects.
- Gradient text and backgrounds throughout.
- Smooth animations powered by Framer Motion for page transitions, hover effects, and the player bar.
- Collapsible sidebar that shows icons only when collapsed and expands on hover or click.
- Fully responsive layout that works on mobile, tablet, and desktop.
- Toast notifications for user actions like adding to playlists or liking tracks.

### Data Persistence
- All user data (playlists, liked tracks, play history, downloads, volume, sidebar state) is saved to the browser's local storage.
- Data loads automatically when the app starts.

### Build and Deployment
- Built with Vite for fast development and production builds.
- Styled with Tailwind CSS.
- Deployed on Vercel with SPA rewrite rules so all routes work on refresh.
- Includes a sitemap and robots.txt for search engines.

### Scraping Scripts
- Added a script to fetch live radio stations from the Radio-Browser API, filtering by genre, country, bitrate, and votes.
- Added a script to scrape copyright-free music from archive.org.
- Added a script to scrape commercially safe music with proper licensing validation.
