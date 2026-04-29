# QuickCalAI Product Launch Videos

Comprehensive video library for QuickCalAI product marketing across multiple platforms and emotional hooks.

## 📦 What's Included

**4 Emotional Hooks × 3 Aspect Ratios = 12 Video Variations**

### Video Variations

1. **Magic Hook** - "Watch this..." transformation (sports schedule → calendar in 3 seconds)
2. **Pain Hook** - Manual typing vs AI extraction (college syllabus use case)
3. **Aspiration Hook** - "Never miss a game day" (family/parent sports schedule)
4. **Curiosity Hook** - "What if you could..." (mixed use cases montage)

### Aspect Ratios

- **16:9 (1920×1080)** - Desktop, YouTube, website hero, LinkedIn
- **1:1 (1080×1080)** - Instagram feed, Facebook, Twitter/X
- **9:16 (1080×1920)** - Instagram Stories, TikTok, Reels, YouTube Shorts

### Duration

All videos are **45 seconds** (1350 frames at 30fps) - optimized for social media attention spans.

## 🚀 Quick Start

### Preview Videos

```bash
cd apps/videos/remotion
pnpm dev
```

This opens the Remotion Studio where you can preview all compositions in the sidebar.

### Render a Single Video

```bash
# Render Magic Hook in desktop format (16:9)
pnpm exec remotion render MagicHook-16:9

# Render Pain Hook in square format (1:1)
pnpm exec remotion render PainHook-1:1

# Render Aspiration Hook in vertical format (9:16)
pnpm exec remotion render AspirationHook-9:16
```

### Render All Videos

```bash
# Render all 12 variations
pnpm exec remotion render --concurrency=2
```

## 📁 Project Structure

```
apps/videos/
├── remotion/
│   └── src/
│       ├── components/          # Reusable UI components
│       │   ├── UploadComponent.tsx
│       │   ├── ProcessingComponent.tsx
│       │   ├── ResultsTableComponent.tsx
│       │   ├── ExportOptionsComponent.tsx
│       │   └── CTAComponent.tsx
│       ├── layouts/             # Responsive layout system
│       │   ├── ResponsiveLayout.tsx
│       │   └── CompositionTemplate.tsx
│       ├── videos/              # Video compositions
│       │   ├── MagicHookVideo.tsx
│       │   ├── PainHookVideo.tsx
│       │   ├── AspirationHookVideo.tsx
│       │   ├── CuriosityHookVideo.tsx
│       │   └── scenes/
│       │       └── HookScene.tsx
│       └── Root.tsx             # Composition registry
└── shared/
    ├── design-tokens.ts         # Brand colors, typography, spacing
    ├── animation-utils.ts       # Animation helpers
    └── assets/                  # Media assets
        ├── use-cases/           # Example schedule images
        ├── ui-mockups/          # UI screenshots
        ├── logos/               # Branding
        └── audio/               # Music & SFX
```

## 🎨 Customization

### Change Use Case Examples

Edit the video files to swap use cases:

```typescript
// In MagicHookVideo.tsx
<ResultsTableComponent
  events={[
    { title: "Your Event", date: "Mon, May 5", time: "4:00 PM", location: "Location" },
    // Add more events...
  ]}
/>
```

### Adjust Timing

Modify scene durations in each video file:

```typescript
const scenes = {
  hook: { start: 0, duration: 90 },        // 3 seconds
  upload: { start: 90, duration: 150 },    // 5 seconds
  // Adjust as needed...
};
```

### Update Branding

Edit `apps/videos/shared/design-tokens.ts`:

```typescript
export const COLORS = {
  primary: "#c23326",    // Your brand color
  background: "#161616", // Background color
  // ...
};
```

### Change Text/Copy

Each video accepts props for customization:

```typescript
<CTAComponent
  headline="Your custom headline"
  subheadline="Your custom subheadline"
  url="yoursite.com"
/>
```

## 📊 Platform Recommendations

### YouTube & Website
- **Use**: Magic Hook or Curiosity Hook in **16:9**
- **Why**: Longer attention span, showcase full features
- **Placement**: Homepage hero, YouTube channel, product demos

### Instagram Feed & Facebook
- **Use**: Aspiration Hook or Pain Hook in **1:1**
- **Why**: Square format performs best in feeds
- **Placement**: Organic posts, carousel ads, boosted posts

### Instagram Stories & TikTok
- **Use**: Magic Hook or Curiosity Hook in **9:16**
- **Why**: Full-screen vertical, fast-paced, mobile-first
- **Placement**: Stories, Reels, TikTok, YouTube Shorts

### LinkedIn
- **Use**: Pain Hook or Curiosity Hook in **16:9**
- **Why**: Professional context, problem-solution framing
- **Placement**: Company page, sponsored content, employee advocacy

### Twitter/X
- **Use**: Magic Hook in **1:1** or **16:9**
- **Why**: Quick transformation, shareable, attention-grabbing
- **Placement**: Organic tweets, promoted tweets, pinned post

## 🎬 Rendering Tips

### High Quality Export

```bash
# 4K quality for YouTube
pnpm exec remotion render MagicHook-16:9 --quality=100 --scale=2

# Optimized for web
pnpm exec remotion render MagicHook-1:1 --quality=85
```

### Batch Rendering

Create a render script:

```bash
#!/bin/bash
# render-all.sh

HOOKS=("MagicHook" "PainHook" "AspirationHook" "CuriosityHook")
FORMATS=("16:9" "1:1" "9:16")

for hook in "${HOOKS[@]}"; do
  for format in "${FORMATS[@]}"; do
    pnpm exec remotion render "${hook}-${format}" "out/${hook}-${format}.mp4"
  done
done
```

### File Naming Convention

Rendered videos follow this pattern:
```
{HookType}-{AspectRatio}.mp4

Examples:
- MagicHook-16:9.mp4
- PainHook-1:1.mp4
- AspirationHook-9:16.mp4
```

## 🔧 Troubleshooting

### Fonts Not Loading

Ensure Google Fonts are installed:
```bash
pnpm add @remotion/google-fonts
```

### Slow Rendering

Use concurrency flag:
```bash
pnpm exec remotion render --concurrency=4
```

### Preview Not Working

Clear cache and restart:
```bash
rm -rf node_modules/.cache
pnpm dev
```

## 📈 A/B Testing Recommendations

Test different hooks for different audiences:

- **Parents/Families**: Aspiration Hook (sports schedule)
- **Students**: Pain Hook (syllabus)
- **Professionals**: Curiosity Hook (mixed use cases)
- **General Audience**: Magic Hook (transformation)

Track metrics:
- View-through rate (VTR)
- Click-through rate (CTR)
- Conversion rate
- Engagement (likes, shares, comments)

## 🎵 Adding Audio (Optional)

Videos are currently silent. To add music and sound effects:

### Background Music

```typescript
import { Audio } from "remotion";

// In your video component
<Audio src={staticFile("audio/music/background.mp3")} volume={0.3} />
```

### Sound Effects

```typescript
// Upload sound
<Audio src={staticFile("audio/sfx/whoosh.mp3")} startFrom={90} />

// Processing beep
<Audio src={staticFile("audio/sfx/beep.mp3")} startFrom={240} />

// Success chime
<Audio src={staticFile("audio/sfx/success.mp3")} startFrom={540} />
```

### Recommended Music Sources

- **Epidemic Sound** - https://epidemicsound.com
- **Artlist** - https://artlist.io
- **Uppbeat** - https://uppbeat.io (free with attribution)
- **YouTube Audio Library** - Free, no attribution required

### Audio Tips

- Keep music volume at 20-30% so it doesn't overpower
- Use upbeat, modern tracks (120-140 BPM)
- Ensure music is loopable for consistent feel
- Add subtle SFX at key moments (upload, processing complete)
- Test with and without audio - most social videos play muted

## 🎯 Next Steps

1. **Add Real Assets**: Replace placeholder images with actual schedule examples
2. **Add Audio**: Background music and sound effects (see above)
3. **Captions**: Add burned-in captions for sound-off viewing
4. **Thumbnails**: Generate custom thumbnails for each video
5. **A/B Test**: Try different hooks on same platform to optimize

## 📝 License

These videos are part of the QuickCalAI project. See main project LICENSE for details.

## 🤝 Contributing

To add new video variations:

1. Create new video component in `src/videos/`
2. Use existing components from `src/components/`
3. Register in `Root.tsx` using `createResponsiveCompositions()`
4. Test in Remotion Studio
5. Document in this README

## 📞 Support

For questions or issues:
- Check Remotion docs: https://remotion.dev
- Review component source code
- Contact: support@rocktownlabs.com
