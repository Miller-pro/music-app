# AudioVerse To-Do List

Things that need to be done, organized by priority.

---

## High Priority

- [ ] Add a backend server and database so user data is not lost when they clear their browser.
- [ ] Add user accounts with sign-up, login, and password reset.
- [ ] Sync playlists, liked tracks, and play history across devices once accounts are working.
- [ ] Add error handling for when audio streams fail to load or drop mid-playback.
- [ ] Test all radio station URLs and remove any that are dead or unreliable.
- [ ] Add loading states and skeleton screens for pages that take time to load.
- [ ] Make the ad system production-ready by connecting it to a real ad provider (Google AdSense, Mediavine, or a custom ad server).

## Medium Priority

- [ ] Add a search results page that shows results across tracks, playlists, and radio stations in one place.
- [ ] Add social sharing so users can share tracks or playlists via a link.
- [ ] Add a "recently played" section on the Home page.
- [ ] Add crossfade between tracks so songs blend smoothly instead of cutting.
- [ ] Add an equalizer or at least bass/treble controls.
- [ ] Add track recommendations based on what the user listens to.
- [ ] Add drag-and-drop reordering for playlist tracks.
- [ ] Let users set a custom cover image for their playlists.
- [ ] Add a "play all" button on the Browse page collections.
- [ ] Improve the mobile player experience with a full-screen player view.
- [ ] Add a dark/light theme toggle.
- [ ] Add pagination or infinite scroll to the Library page for large catalogs.

## Low Priority

- [ ] Add podcast support with episode listing, show pages, and resume-where-you-left-off.
- [ ] Add offline mode using a service worker so users can listen without internet.
- [ ] Add lyrics display for tracks that have them.
- [ ] Add a sleep timer that stops playback after a set time.
- [ ] Add playback speed control (useful for podcasts).
- [ ] Add keyboard shortcut hints in the UI so users know they exist.
- [ ] Add multi-language support.
- [ ] Add accessibility improvements: screen reader labels, focus management, and high contrast mode.
- [ ] Add analytics to track which tracks and features are most popular.
- [ ] Add an admin panel for managing the music catalog without editing JSON files.
- [ ] Let publishers see ad performance stats in a dashboard instead of just a calculator.
- [ ] Add A/B testing support for ad placements so publishers can compare performance.
- [ ] Write automated tests for the player, playlist, and ad logic.

## Bugs and Cleanup

- [ ] Check that all localStorage operations handle quota exceeded errors gracefully.
- [ ] Make sure the player bar does not overlap page content on very small screens.
- [ ] Check that the sidebar overlay on mobile closes properly when navigating to a new page.
- [ ] Verify that shuffle mode works correctly when the queue changes mid-playback.
- [ ] Review the catalog data for duplicate tracks or broken cover art URLs.
- [ ] Clean up any unused CSS classes or components.
