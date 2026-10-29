# AZ Digital

Full-screen creative-studio hero inspired by the supplied interaction reference. Only the brush-script word “Айдентика” uses the original lettering artwork, as explicitly requested by the client. All other heading lines are real HTML text.

## Run and build

```sh
npm run dev       # http://localhost:3000 (Node.js 20+)
npm run check
npm test
npm run build     # standalone dist/index.html
```

No runtime dependencies or API keys. Set `PORT=8080` to change the local server port. `vercel.json` configures the static build. The generated page embeds application code, data and fonts; only demo images use an external CDN.

## Typography

- **Original client lettering**: only “Айдентика,” in `assets/identity-lettering.svg`, isolated from the supplied reference.
- **Roboto Condensed Light (300)**: narrow “дизайн меню” line and support signature (now Regular 400). The signature remains 19px on desktop, rather than growing with the main title.
- **Manrope ExtraBold (800)**: “и фуд-фото”.

Fonts are self-hosted as embedded WOFF2 data in `assets/condensed-font.css` and `assets/bold-font.css`. Their SIL Open Font License notices are included in `assets/FONT-LICENSES.txt`. Fonts came from Google Fonts. The client specifically rejected the replacement brush font and requested restoring that one word from the supplied reference. “дизайн меню”, “и фуд-фото” and the thin signature remain selectable text.

## Entrance and interactions

- A single shared camera pullback moves the wall and text together: 4.1× zoom, −45° rotation and slight perspective tilt settle to the final composition over 3.1 seconds.
- Whole-scene blur and a black veil clear smoothly during that motion. Reduced-motion users get the final state immediately.
- Image cards preserve their aspect ratios with uniform edge scaling. Pan and hover comparisons use time-based requestAnimationFrame damping, not raw pointer jumps.
- Drag the staggered, infinitely wrapping wall. Open a card for a before/after comparison dialog with keyboard navigation.
- Navigation starts hidden/inert and appears after 24px of scrolling. There are no bottom instructions or information bars.
- The centered transparent CTA fills completely white, with dark text, on hover.

**Pending contact configuration:** the owner has not yet supplied a Telegram, WhatsApp or email destination for “Обсудить проект”. The CTA’s visual hover is active, but no contact navigation or submission is wired. No contact endpoint or destination is invented and no visitor data is collected.

## Deployment

Public site: https://az-digital.vercel.app

Published to the owner’s Vercel account using a standalone Drop deployment. Repository changes require another deployment unless Git integration is later enabled.

## Demo assets and scope

This is a frontend study, not an AI generation service or the entire Krea product. `gallery.json` contains 99 image pairs and captions from the user-provided HTML. Demo images are referenced remotely from Krea’s public image CDN, not bundled or relicensed. Their rights remain with the respective owners. Replace these URLs with owned/licensed portfolio work before commercial use. An unavailable-image fallback is included.

The signature uses the locally embedded `assets/condensed-regular-font.css` at weight 400, preserving its existing 19px desktop size and line breaks.
