# Audio Assets

Place your background music file here:

- **File:** `assets/music-placeholder.mp3`
- **Format:** MP3, 44100Hz, stereo
- **Duration:** 15 seconds (or longer, will be trimmed)
- **Volume:** Adjust in component via `volume` prop (currently 0.5)

The placeholder is referenced in:
- `src/videos/PremiumPromoB.tsx`
- `src/videos/PremiumPromoBLight.tsx`

Replace the placeholder with your actual track and re-render.

## Recommended Track Specs

| Property | Recommendation |
|----------|---------------|
| Tempo | 100-120 BPM |
| Style | Lo-fi, chill tech, ambient |
| Mood | Optimistic, productive, calm |
| Energy | Low-to-mid (don't overpower voiceover) |
| License | Royalty-free (Epidemic Sound, Artlist, Uppbeat) |

## Render Commands (after adding music)

```bash
npx remotion render PremiumPromoB-desktop out/promo-b-desktop.mp4 --quality=95
npx remotion render PremiumPromoB-square out/promo-b-square.mp4 --quality=85
npx remotion render PremiumPromoB-vertical out/promo-b-vertical.mp4 --quality=85
npx remotion render PremiumPromoB-desktop-light out/promo-b-desktop-light.mp4 --quality=95
npx remotion render PremiumPromoB-square-light out/promo-b-square-light.mp4 --quality=85
npx remotion render PremiumPromoB-vertical-light out/promo-b-vertical-light.mp4 --quality=85
```
