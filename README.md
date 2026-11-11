# Asish & Ipsita: Shubha Nirbandha

A single-page engagement invitation for Asish Sahoo and Ipsita Senapati
(Sunday, 6 December 2026, Hotel Pal Heights, Bhubaneswar), designed as an embroidered Odia wedding card:
ivory silk cards with zari borders, pearls and sequins, laid on a warm white page.

Guests move through it like this:

1. They tap the wax seal on a silk envelope. The flap opens and the card slides out and grows into the page.
2. The first page shows the Ganesh mantra in Odia script under a marigold toran, with a kalash and lit diyas.
3. Next is a card with a temple-arch window flanked by elephants. As guests scroll, the view zooms through the window into the film, and the names appear over it.
4. A gatefold invitation opens to embroidered peacocks.
5. Then come the couple, the date with the panchang and a countdown, and a sphere of photographs.
6. The venue page has an interactive map with the hotel, the airport, the railway station and Lingaraj Temple pinned.
7. The reply card is sealed with wax and sends the RSVP on WhatsApp.
8. At the end, guests can float diyas on a lake.

Everything is static: fonts, GSAP, ScrollTrigger, Lenis, Leaflet and the artwork are inside `assets/`, so it runs on GitHub Pages without any build step.
Visitors who have reduced motion turned on get the same card without the movement.

## Put it on GitHub Pages

1. Create a new repository on GitHub (for example `asish-ipsita`).
2. Upload everything in this folder (`index.html`, `assets/`, `README.md`, `.nojekyll`) to the root of the repository.
3. Go to **Settings → Pages**, set **Source** to *Deploy from a branch*, choose `main` and `/ (root)`, then save.
4. After a minute the site is live at `https://<your-username>.github.io/asish-ipsita/`.

To preview on your own computer, run `python3 -m http.server` in this folder and open http://localhost:8000.
Opening the file with a double-click blocks the fonts and the film.

## Things to edit

| What | Where |
| --- | --- |
| Ceremony time | `CONFIG.time` near the end of `index.html`, e.g. `'18:30'` (IST, 24-hour). The time then shows on the names page and the invitation, and the countdown runs to it. If you leave it blank, no time is shown. |
| WhatsApp number that receives RSVPs | `CONFIG.rsvpWhatsApp`, e.g. `'919876543210'` (country code + number, no `+`). If you leave it blank, guests choose the contact in WhatsApp themselves. |
| Ipsita's parents | Search `index.html` for "Senapati family". It appears in the invitation and on the couple page. Replace it with her parents' names. |
| Couple portraits | In `index.html`, the two `<img>` tags inside "THE COUPLE" point to Unsplash placeholders. Put your photos in `assets/photos/` (square or portrait) and change the two `src` values, e.g. `assets/photos/asish.jpg`. They are cropped to circles. |
| Photo sphere | `CONFIG.moments`. Each entry has a `src` and a `title`. Add `caption: '...'` for a line under the photo. Use as many photos as you like; local paths such as `assets/photos/01.jpg` work. |
| Film behind the window | `CONFIG.heroVideo`. Scrolling plays it forwards and backwards while the view zooms through the arch. `src` is a Cloudinary copy prepared for scrubbing (a keyframe every 0.2 s, no audio), `fallback` is the original upload, `poster` is its first frame. To use your own file, put it in `assets/`, point all three at it, and encode it first with `ffmpeg -i in.mp4 -an -g 6 -crf 23 -movflags +faststart assets/film.mp4`. |
| Map pins | `CONFIG.venue.pin` is the hotel's latitude and longitude; `CONFIG.venue.landmarks` lists the other pins (add `side: 'b'` to put a label under its pin). |
| Colours | The palette is at the top of the `<style>` block (`--page` for the background, `--wine`, `--sindoor`, `--gold`, `--paper`). |

The current photos are Unsplash placeholders loaded from images.unsplash.com.
Replace them with your own before you share the link widely.

## WhatsApp link preview

WhatsApp needs a full URL for the preview image. Once the site is live, change

```html
<meta property="og:image" content="assets/og-image.jpg">
```

to the full address, e.g. `https://<your-username>.github.io/asish-ipsita/assets/og-image.jpg`.

## Hindu calendar details used

Sunday, 6 December 2026: Margashirsha Krishna Trayodashi (Purnimanta, as followed in Odisha), Swati nakshatra,
Vikram Samvat 2083, Shaka 1948. It is also a Ravi Pradosh. Check with your family priest for the exact muhurta.

## Files

- `index.html`: the page, its styles and `CONFIG`
- `assets/js/site.js`: envelope, page animations, the zoom through the arch, photo sphere, map, RSVP, lake
- `assets/js/leaflet.js`, `assets/css/leaflet.css`: the map library
- `assets/js/ornaments.js`: line art drawn live (arch shapes, mandala, Konark wheel, divider)
- `assets/art/`: the embroidered artwork (zari border, toran, envelope, wax seal, peacocks, elephants, kalash, diya, lotus pond, portrait rings, corner paisleys) and the silk and velvet textures

## Credits

Fonts: Cormorant Garamond, Jost, Noto Serif Oriya (SIL Open Font License).
Animation: GSAP with ScrollTrigger (GreenSock standard license, free) and Lenis (MIT).
Map: Leaflet (BSD-2-Clause) with map tiles © OpenStreetMap contributors © CARTO.
Placeholder photographs: Unsplash (Unsplash License).
