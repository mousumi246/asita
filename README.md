# Asish & Ipsita: Shubha Nirbandha

A single-page engagement invitation for Asish Sahoo and Ipsita Senapati
(Sunday, 6 December 2026, Pal Heights Mantra, Pahala, Bhubaneswar), designed as an embroidered Odia wedding card:
ivory silk cards with zari borders, pearls and sequins, laid on a warm white page.

Guests move through it like this:

1. While the card loads, twelve lotus petals open around the wax seal. When everything has arrived the seal is pressed and flies onto the envelope.
2. They tap the seal. The flap opens and the card slides out and grows into the page.
3. The first page draws a gold mandala and types the Ganesh mantra under a marigold toran, with a kalash and lit diyas. "Jai Jagannath" is the only line kept in Odia script.
4. Next is a card with a temple-arch window flanked by elephants. As guests scroll, the view zooms through the window into the film, and the names appear over it in a shower of stardust.
5. A gatefold invitation opens to embroidered peacocks and names both sets of parents.
6. Then come the couple, the date with the panchang, and a sphere of photographs.
7. The venue page has an interactive map with Pal Heights Mantra, the airport and the railway station pinned.
8. The reply card is sealed with wax and sends the RSVP on WhatsApp.
9. At the end, guests can float diyas on a lake, and a split-flap clock counts down to the day.

Touching or clicking anywhere leaves a little gold stardust. Cards unfold as they arrive, section titles are written on by a sparkling pen, and the zari borders catch the light.

Everything except the map, the film and the placeholder photos is inside `assets/` (fonts, GSAP, ScrollTrigger, Lenis and the artwork), so it runs on GitHub Pages without any build step.
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
| Couple portraits | In `index.html`, the two `<img>` tags inside "THE COUPLE" point to Unsplash placeholders. Put your photos in `assets/photos/` (square or portrait) and change the two `src` values, e.g. `assets/photos/asish.jpg`. They are cropped to circles. |
| Photo sphere | `CONFIG.moments`. Each entry has a `src` and a `title`. Add `caption: '...'` for a line under the photo. Use as many photos as you like; local paths such as `assets/photos/01.jpg` work. |
| Film behind the window | `CONFIG.heroVideo`. Scrolling plays it forwards and backwards while the view zooms through the arch. `src` is a Cloudinary copy prepared for scrubbing (a keyframe every 0.2 s, no audio), `fallback` is the original upload, `poster` is its first frame. To use your own file, put it in `assets/`, point all three at it, and encode it first with `ffmpeg -i in.mp4 -an -g 6 -crf 23 -movflags +faststart assets/film.mp4`. |
| Google Maps key | `CONFIG.venue.mapsKey`. See "Protect the Google Maps key" below. If the key is missing or refused, the page shows a plain Google Maps embed instead. |
| Map pins | `CONFIG.venue.pin` is the hotel's latitude and longitude (taken from the Pal Heights Mantra Google Maps link); `CONFIG.venue.landmarks` lists the other pins (add `side: 'b'` to put a label under its pin). `CONFIG.venue.maps` is the link the "Get directions" button opens. |
| Colours | The palette is at the top of the `<style>` block (`--page` for the background, `--wine`, `--sindoor`, `--gold`, `--paper`). |

The current photos are Unsplash placeholders loaded from images.unsplash.com.
Replace them with your own before you share the link widely.

## Protect the Google Maps key

The key sits in the page, so anyone can read it, as with every website that uses Google Maps.
Lock it down so nobody else can use it on your bill:

1. Open Google Cloud Console → **APIs & Services → Credentials** and click the key.
2. Under **Application restrictions**, choose **Websites** and add `https://<your-username>.github.io/*`
   (and `http://localhost:8000/*` if you preview locally).
3. Under **API restrictions**, choose **Restrict key** and tick **Maps JavaScript API** only.
4. Make sure the key's project has billing enabled and the Maps JavaScript API turned on, otherwise Google shows an error on the map.
   A wedding site's traffic stays well inside Google's free monthly allowance for maps.

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
- `assets/js/site.js`: loader, envelope, stardust, page animations, the zoom through the arch, photo sphere, map, RSVP, lake, countdown
- `assets/js/ornaments.js`: line art drawn live (arch shapes, mandala, Konark wheel, divider)
- `assets/art/`: the embroidered artwork (zari border, toran, envelope, wax seal, peacocks, elephants, kalash, diya, lotus pond, portrait rings, corner paisleys) and the silk and velvet textures

## Credits

Fonts: Cormorant Garamond, Jost, Noto Serif Oriya for "Jai Jagannath" (SIL Open Font License).
Animation: GSAP with ScrollTrigger (GreenSock standard license, free) and Lenis (MIT).
Map: Google Maps JavaScript API.
Placeholder photographs: Unsplash (Unsplash License).
