# Asish & Ipsita: Engagement & Ring Ceremony

A single-page engagement invitation for Asish Kumar Sahoo and Ipsita Senapati
(Sunday, 6 December 2026, Feelings Hall, 1st Floor, Pal Heights Mantra, Pahala, Bhubaneswar), designed as an embroidered Odia wedding card:
ivory silk cards with zari borders, pearls and sequins, laid on a warm white page.

Guests move through it like this:

1. While the card loads, twelve lotus petals open around the wax seal. When everything has arrived the seal is pressed and flies onto the envelope.
2. They tap the seal. The flap opens and the card slides out, grows, and opens like an iris into the opening film.
   A third of the way in, "Asish & Ipsita are getting engaged" is written over it in gold. When the film ends
   (or a guest taps **Continue**, scrolls or swipes), gold light blooms from the centre and carries them into the first page.
   On a phone held upright, a landscape film is shown whole, framed by a soft blurred copy of itself, with the names above it.
   The film plays silently; the song is its soundtrack. The menu has **The opening film** to watch it again.
   The song ("Dilruba Dilnasheen" by Rito Riba, from 0:21) starts softly with the tap on the seal and keeps playing in the background.
3. The first page draws a gold mandala and types the Ganesh mantra under a marigold toran, with a kalash and lit diyas. "Jai Jagannath" is the only line kept in Odia script.
4. A gatefold invitation opens to embroidered peacocks and names both sets of parents.
5. Then come the couple, the date with the panchang, and a sphere of photographs.
6. The venue page has an interactive map with Pal Heights Mantra, the airport and the railway station pinned.
7. The reply card is sealed with wax. Guests press **Send my reply on WhatsApp** under the seal, and a pre-written message opens in WhatsApp.
8. At the end, clay diyas on sal-leaf cups float across a lake at dusk, and guests can tap the water to float more. A few seconds after a guest types their name in the reply form (no need to send it first), their own brass swan diya sets out on the lake with the name above it, and keeps gliding to and fro while the lake is in view. A split-flap clock counts down to the day.

Touching or clicking anywhere leaves a little gold stardust, and dragging a finger leaves a fine trail. Cards unfold as they arrive, section titles are written on by a sparkling pen, and the zari borders catch the light.

The things guests use over and over stay quick: the menu opens in under half a second and the page starts moving the moment a link is tapped,
the photo viewer opens in half a second and the arrow keys change photographs at once, and **Skip** on the opening film goes straight to the card.
Someone opening the invitation a second time gets a shorter loader.

**Auto-scroll.** Five seconds after the page opens, it starts scrolling itself: about one screen every 7 seconds, moving the same distance on every frame so the text stays steady.
It speeds up a little while the folded card opens, then holds the open card still for four seconds while its lettering is written in.
The moment a guest touches the screen, clicks, uses the wheel or a scrolling key, it stops and they are in control.
While the page is moving, the gold shimmer and the border glints rest, and they carry on as soon as it stops: that keeps phones at a steady frame rate.
The **Pause / Auto-scroll** button in the bottom-right corner stops and restarts it. The button steps out of the way while the reply
form is on screen and disappears at the very end. Visitors who have asked their phone for reduced motion are not scrolled
automatically, but the button is there if they want it. (The music button does not stop the scrolling.)

Everything a guest needs to read is at least 13px, including the date, the venue and the parents' names on the folded card,
which keeps its full size on phones from 360px wide (its large lettering and spacing adjust to the screen's height instead).
Each section has a heading, so screen readers can jump between them.

Everything except the map, the films and the photographs (on Cloudinary) is inside `assets/` (fonts, GSAP, ScrollTrigger, Lenis and the artwork), so it runs on GitHub Pages without any build step.
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
| Opening film | `CONFIG.opening`: `src` is a Cloudinary copy sized for the web, `fallback` the original upload, `poster` its first frame. `revealAt` is the second at which the names appear (0 means about a third of the way in). |
| Couple portraits | In `index.html`, the two `<img>` tags inside "THE COUPLE". Cloudinary crops them to a square around the face (`c_fill,g_auto:faces`); `data-raw` is the original, used if the crop fails. They are shown in circles. |
| Photo sphere | `CONFIG.moments`. Each entry has a `src` and a `title`. Add `caption: '...'` for a line under the photo (otherwise `CONFIG.momentCaption` is used). Cloudinary photos are cropped around faces on the sphere and shown whole when tapped. Use as many photos as you like; local paths such as `assets/photos/01.jpg` work. |
| Background music | `CONFIG.music`: `src` is the song, `volume` how loud it plays (0 to 1; it is set to 0.2, which is soft), `start` the second it begins from (21) and loops back to. It starts when the seal is tapped, fades in over a few seconds, fades out before each loop, goes quiet while the tab is hidden, and the **Music** button in the header turns it off and on. |
| Hall | `CONFIG.venue.hall` ("Feelings Hall, 1st Floor") is put before the hotel's name in the calendar event, the copied address and the WhatsApp reply. The card, the venue page, the menu and the countdown carry it in their text. |
| Google Maps key | `CONFIG.venue.mapsKey`. See "Protect the Google Maps key" below. If the key is missing or refused, the page shows a plain Google Maps embed instead. |
| Map pins | `CONFIG.venue.pin` is the hotel's latitude and longitude (taken from the Pal Heights Mantra Google Maps link); `CONFIG.venue.landmarks` lists the other pins (add `side: 'b'` to put a label under its pin). `CONFIG.venue.maps` is the link the "Get directions" button opens. |
| Colours | The palette is at the top of the `<style>` block (`--page` for the background, `--wine`, `--sindoor`, `--gold`, `--paper`). |


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
- `assets/js/site.js`: loader, music, envelope, opening film, stardust, page animations, photo sphere, map, RSVP, lake, countdown
- `assets/js/ornaments.js`: line art drawn live (arch shapes, mandala, Konark wheel, divider)
- `assets/art/`: the embroidered artwork (zari border, toran, envelope, wax seal, peacocks, kalash, diya, lotus pond, portrait rings, corner paisleys) and the silk and velvet textures

## Credits

Made with love by Project Arthouse ([projectarthouse.com](https://projectarthouse.com), [@project.arthouse](https://www.instagram.com/project.arthouse/)).

Fonts: Cormorant Garamond, Jost, Noto Serif Oriya for "Jai Jagannath" (SIL Open Font License).
Animation: GSAP with ScrollTrigger (GreenSock standard license, free) and Lenis (MIT).
Map: Google Maps JavaScript API.
Photographs, the opening film and the song: supplied by the families.
