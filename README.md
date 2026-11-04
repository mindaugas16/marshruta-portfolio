# marshruta.lt

Rūta Morkūnė's portfolio, generated from her Figma file and served by GitHub Pages.

- `slides.json` — every slide's Figma frame, in page order. The site is built from it.
- `assets/slides/` — every slide as WebP (1920 and 960 wide); for animated slides this is the poster.
- `assets/video/` — animated slides, rendered by Figma as MP4.

## Updating after a Figma change

Open this folder in Claude Code and say **"update the site from Figma"**. That runs
`.claude/skills/update-portfolio`, which re-exports the slides, rebuilds, previews and pushes.

By hand:

```bash
node scripts/build.mjs                 # regenerate index.html from slides.json
python3 -m http.server 4173            # preview at http://localhost:4173
```

## Conventions in Figma

- One top-level 1920×1080 frame per slide, ordered top to bottom.
- Edit frames rather than duplicating them, so their ids stay the same.
- Put a "<-- animacija" label next to a frame that has animation.
