# Render & Export Guide

Optimized rendering configurations for QuickCalAI videos across different platforms.

## 🎬 Render Commands

### Quick Renders (Development)

```bash
# Preview quality - fast rendering
pnpm exec remotion render MagicHook-16:9 --quality=50

# Standard quality - balanced
pnpm exec remotion render MagicHook-16:9 --quality=80
```

### Production Renders

```bash
# YouTube / Website (High Quality)
pnpm exec remotion render MagicHook-16:9 out/magic-hook-youtube.mp4 \
  --quality=95 \
  --codec=h264 \
  --audio-codec=aac

# Instagram Feed (Optimized)
pnpm exec remotion render MagicHook-1:1 out/magic-hook-instagram.mp4 \
  --quality=85 \
  --codec=h264 \
  --audio-codec=aac

# TikTok / Stories (Mobile Optimized)
pnpm exec remotion render MagicHook-9:16 out/magic-hook-stories.mp4 \
  --quality=85 \
  --codec=h264 \
  --audio-codec=aac
```

## 📊 Platform-Specific Settings

### YouTube
- **Format**: 16:9 (1920×1080)
- **Quality**: 95-100
- **Codec**: H.264
- **Bitrate**: High
- **Audio**: AAC, 192kbps
- **Max Size**: No limit (but keep under 128GB)

```bash
pnpm exec remotion render MagicHook-16:9 out/youtube.mp4 --quality=95
```

### Instagram Feed
- **Format**: 1:1 (1080×1080)
- **Quality**: 85
- **Codec**: H.264
- **Max Duration**: 60s
- **Max Size**: 100MB
- **Audio**: AAC, 128kbps

```bash
pnpm exec remotion render MagicHook-1:1 out/instagram-feed.mp4 --quality=85
```

### Instagram Stories / Reels
- **Format**: 9:16 (1080×1920)
- **Quality**: 85
- **Codec**: H.264
- **Max Duration**: 60s (Stories), 90s (Reels)
- **Max Size**: 100MB
- **Audio**: AAC, 128kbps

```bash
pnpm exec remotion render MagicHook-9:16 out/instagram-stories.mp4 --quality=85
```

### TikTok
- **Format**: 9:16 (1080×1920)
- **Quality**: 85
- **Codec**: H.264
- **Max Duration**: 60s (recommended)
- **Max Size**: 287.6MB
- **Audio**: AAC, 128kbps

```bash
pnpm exec remotion render MagicHook-9:16 out/tiktok.mp4 --quality=85
```

### Facebook
- **Format**: 1:1 (1080×1080) or 16:9 (1920×1080)
- **Quality**: 85
- **Codec**: H.264
- **Max Duration**: 240 minutes
- **Max Size**: 10GB
- **Audio**: AAC, 128kbps

```bash
pnpm exec remotion render MagicHook-1:1 out/facebook.mp4 --quality=85
```

### LinkedIn
- **Format**: 16:9 (1920×1080)
- **Quality**: 85-90
- **Codec**: H.264
- **Max Duration**: 10 minutes
- **Max Size**: 5GB
- **Audio**: AAC, 128kbps

```bash
pnpm exec remotion render PainHook-16:9 out/linkedin.mp4 --quality=90
```

### Twitter/X
- **Format**: 1:1 (1080×1080) or 16:9 (1920×1080)
- **Quality**: 85
- **Codec**: H.264
- **Max Duration**: 140s
- **Max Size**: 512MB
- **Audio**: AAC, 128kbps

```bash
pnpm exec remotion render MagicHook-1:1 out/twitter.mp4 --quality=85
```

## 🚀 Batch Rendering

### Render All Variations

```bash
#!/bin/bash
# render-all.sh

mkdir -p out

HOOKS=("MagicHook" "PainHook" "AspirationHook" "CuriosityHook")
FORMATS=("16:9" "1:1" "9:16")

for hook in "${HOOKS[@]}"; do
  for format in "${FORMATS[@]}"; do
    echo "Rendering ${hook}-${format}..."
    pnpm exec remotion render "${hook}-${format}" "out/${hook}-${format}.mp4" --quality=85
  done
done

echo "✅ All videos rendered!"
```

Make executable and run:
```bash
chmod +x render-all.sh
./render-all.sh
```

### Render Specific Platform Set

```bash
#!/bin/bash
# render-social.sh

mkdir -p out/social

# Instagram Feed (1:1)
pnpm exec remotion render MagicHook-1:1 out/social/instagram-magic.mp4 --quality=85
pnpm exec remotion render AspirationHook-1:1 out/social/instagram-aspiration.mp4 --quality=85

# Instagram Stories (9:16)
pnpm exec remotion render MagicHook-9:16 out/social/stories-magic.mp4 --quality=85
pnpm exec remotion render CuriosityHook-9:16 out/social/stories-curiosity.mp4 --quality=85

# YouTube (16:9)
pnpm exec remotion render MagicHook-16:9 out/social/youtube-magic.mp4 --quality=95
pnpm exec remotion render CuriosityHook-16:9 out/social/youtube-curiosity.mp4 --quality=95

echo "✅ Social media set rendered!"
```

## 📦 File Size Optimization

### Reduce File Size

If videos are too large:

```bash
# Lower quality
pnpm exec remotion render MagicHook-1:1 --quality=75

# Use ProRes (smaller file, same quality)
pnpm exec remotion render MagicHook-1:1 --codec=prores

# Adjust CRF (lower = better quality, higher = smaller file)
pnpm exec remotion render MagicHook-1:1 --crf=23
```

### Check File Size

```bash
ls -lh out/*.mp4
```

### Compress After Rendering

Use FFmpeg for additional compression:

```bash
ffmpeg -i out/MagicHook-16:9.mp4 -vcodec h264 -crf 23 out/MagicHook-16:9-compressed.mp4
```

## ⚡ Performance Optimization

### Faster Rendering

```bash
# Use multiple CPU cores
pnpm exec remotion render MagicHook-16:9 --concurrency=4

# Disable audio if not needed
pnpm exec remotion render MagicHook-16:9 --muted

# Use GPU acceleration (if available)
pnpm exec remotion render MagicHook-16:9 --gl=angle
```

### Render Progress

```bash
# Show detailed progress
pnpm exec remotion render MagicHook-16:9 --log=verbose

# Quiet mode (only errors)
pnpm exec remotion render MagicHook-16:9 --log=error
```

## 🎨 Custom Exports

### Export as GIF

```bash
pnpm exec remotion render MagicHook-1:1 out/magic.gif --image-format=gif
```

### Export Frame Sequence

```bash
pnpm exec remotion render MagicHook-16:9 out/frames --sequence --image-format=png
```

### Export Specific Frame Range

```bash
# Render only first 10 seconds
pnpm exec remotion render MagicHook-16:9 --frames=0-300
```

## 📋 Render Checklist

Before final render:

- [ ] Preview in Remotion Studio
- [ ] Check all text is readable
- [ ] Verify animations are smooth
- [ ] Test on target platform (upload test file)
- [ ] Confirm file size is within limits
- [ ] Check audio levels (if applicable)
- [ ] Verify aspect ratio matches platform
- [ ] Test on mobile device (for vertical videos)

## 🐛 Troubleshooting

### Render Fails

```bash
# Clear cache
rm -rf node_modules/.cache

# Reinstall dependencies
pnpm install

# Try with lower concurrency
pnpm exec remotion render MagicHook-16:9 --concurrency=1
```

### Out of Memory

```bash
# Increase Node memory
NODE_OPTIONS="--max-old-space-size=8192" pnpm exec remotion render MagicHook-16:9
```

### Slow Rendering

```bash
# Use faster codec
pnpm exec remotion render MagicHook-16:9 --codec=h264-mkv

# Reduce quality temporarily
pnpm exec remotion render MagicHook-16:9 --quality=60
```

## 📊 Estimated Render Times

On M1 MacBook Pro (16GB RAM):

- **16:9 (1920×1080)**: ~2-3 minutes per video
- **1:1 (1080×1080)**: ~1.5-2 minutes per video
- **9:16 (1080×1920)**: ~2-3 minutes per video

All 12 videos: ~25-35 minutes total

## 🎯 Recommended Workflow

1. **Development**: Render at quality=50 for quick previews
2. **Review**: Render at quality=80 for client/team review
3. **Production**: Render at quality=85-95 for final delivery
4. **Archive**: Keep source files and high-quality renders

## 📁 Output Organization

```
out/
├── youtube/
│   ├── magic-hook.mp4
│   ├── pain-hook.mp4
│   ├── aspiration-hook.mp4
│   └── curiosity-hook.mp4
├── instagram/
│   ├── feed/
│   │   ├── magic-hook.mp4
│   │   └── aspiration-hook.mp4
│   └── stories/
│       ├── magic-hook.mp4
│       └── curiosity-hook.mp4
├── tiktok/
│   ├── magic-hook.mp4
│   └── curiosity-hook.mp4
└── linkedin/
    ├── pain-hook.mp4
    └── curiosity-hook.mp4
```

## 🔗 Resources

- [Remotion Rendering Docs](https://www.remotion.dev/docs/render)
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [Platform Video Specs](https://www.socialmediatoday.com/news/social-media-video-specs-guide/593347/)
