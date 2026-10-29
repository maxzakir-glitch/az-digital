# AZ Digital

A responsive, standalone recreation of the **interactive image wall** in the supplied Krea reference, branded for AZ Digital. No framework, build step, API key or runtime package dependencies.

## Run

```sh
npm install
npm run dev
# http://localhost:3000
```

Requires Node.js 20+. `PORT=8080 npm start` selects another port. For a static host, publish this folder (entry point `index.html`); do not open with `file://` because the gallery data loads with fetch.

```sh
npm run check
npm test
```

## Interactions

- 99 image pairs arranged in a staggered, infinitely wrapping 11 × 9 wall.
- Soft lens falloff scales perimeter cards uniformly, preserving image proportions.
- Drag to pan with requestAnimationFrame easing; time-based, damped pointer parallax (no direct pointer-to-transform jumps).
- Hover a central card for a pointer-controlled before/after wipe.
- Click/tap a card for animated expansion into an accessible native dialog.
- Drag the comparison slider; use previous/next buttons or arrow keys to browse. Escape closes the dialog and restores focus.
- Horizontal touch swipes pan; vertical gestures retain page scrolling.
- Responsive mobile layout, theme switch (system preference respected initially), keyboard access and reduced-motion support.

## Files

- `app.js`: wall geometry, pan input, reveal and dialogs.
- `styles.css`: visual system, responsive layout and animation.
- `gallery.json`: image pairs and captions extracted from the user-provided HTML.
- `server.mjs`: dependency-free local static server.
- `tests/data.test.mjs`: data and DOM integrity checks.

## Hosting

Run `npm run build` to generate a standalone `dist/index.html` with embedded styles, application code, gallery data and fallback. Deploy `dist/` to any static host. `vercel.json` configures the build automatically. Alternatively run `npm start` on a Node host. Repository creation does not automatically publish a live website.

## Scope and assets

This is an independent frontend study of the specific wall animation, **not the entire Krea app and not an AI generation service**. The original website's exact runtime implementation was not copied; the lens and interactions were implemented independently based on the provided HTML and observed behavior.

Demo images are referenced remotely from Krea's public image CDN, as in the supplied reference. They are not bundled or relicensed. Rights remain with their respective owners; replace the URLs in `gallery.json` with assets you own or are licensed to use before commercial publication. CDN availability is external; an unavailable-image fallback is included. UI source code is supplied for this project without claiming rights to demo imagery, Krea trademarks or third-party content.

## Hero layout
The client headline is centered over a full-bleed, darkened image wall. Uniform scaling avoids stretched edge images. Reveal and pointer motion share a time-based requestAnimationFrame loop; reduced-motion disables interpolation.

## Entrance animation
The full-viewport wall softly settles from scale 1.16 to 1 over 2.1 seconds. Headline groups appear through an 18px blur with a 90ms stagger and ease-out. The wall waits briefly for visible preview images before starting; there is a timeout so a slow CDN never blocks the heading. Reduced-motion users see the final state immediately.

Public production site: https://az-digital.vercel.app (published via Vercel Drop; repository changes require a new deployment unless Git integration is configured).

## Navigation
The hero is a pinned, full-viewport opening screen. Navigation is hidden and inert initially; scrolling more than 24px reveals the fixed header. There are no interaction hints or bottom information bars.

## Project inquiry CTA
The centered outline CTA is styled and intentionally disabled until the owner supplies the Telegram, WhatsApp or email destination. No contact endpoint is invented and no visitor details are collected. Headline uses Manrope ExtraBold (800), with Manrope 600 for the CTA, served from Google Fonts.
