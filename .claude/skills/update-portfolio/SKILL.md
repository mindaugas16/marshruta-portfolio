---
name: update-portfolio
description: Sync the marshruta.lt portfolio site with Rūta's Figma file — re-export changed slides, re-render animated slides as video, add or remove slides, rebuild index.html, preview, then commit and push to GitHub Pages. Use when asked to "update the site", "sync from Figma", "Rūta changed the portfolio", or after any edit in the Figma file.
---

# Update the portfolio from Figma

The site is generated from `slides.json`, which lists every slide's Figma frame in page order.
Figma is the source of truth; never edit slide images by hand.

## How slides are represented

| `slides.json` entry | Served as | Source |
|---|---|---|
| plain | `assets/slides/<n>.webp` + `<n>-960.webp` | `get_screenshot` of the frame |
| `"video": true` | `assets/video/<n>.mp4`, poster `assets/slides/<n>.webp` | `export_video` of the frame |

(`build.mjs` also supports `"html": "partials/…"` for a hand-built slide; none are used right now.)

`n` is a stable file id, **not** the position. Order comes from the array order. A new slide gets the
next unused number; a removed slide's number is never reused.

## Steps

1. **Open the file.** Read `slides.json` for `figma.fileKey`, then `create_session` with it.
2. **List frames.** `get_metadata` on page `0:1`. The output is large; save it and extract the
   top-level `<frame>`/`<instance>` lines that are 1920×1080 and not `hidden`, sorted by `y`.
   Diff against `slides.json`: new node ids, missing node ids, order changes.
   If slides were added or removed, show the user the diff and wait for a yes before continuing.
3. **Find animation.** Rūta marks animated frames with a "<-- animacija" text label on the canvas to
   the right of the frame. Match each label to the frame whose y-range contains the label's y →
   `"video": true`. A frame that lost its label goes back to a plain slide (delete its mp4).
4. **Export stills.** `get_screenshot` (maxDimension 1920) for every slide, including video
   slides (their still is the poster). Download each to
   `raw/export/<n>.png` (`raw/` is gitignored), then run
   `scripts/optimize-slides.sh raw/export`.
5. **Export videos.** `export_video` (quality `high`, fps 30) on each video slide's frame — for an
   instance, the instance itself is the root. Figma allows ~5 renders at once; start at most five,
   download them, then the rest. Download to `assets/video/<n>.mp4` before `availableUntil`.
   Figma has returned another frame's render before: run `shasum assets/video/*.mp4` (no two may
   match) and compare `qlmanage -t` first-frame thumbnails against each slide's still.
6. **See what changed.** `git status --short assets/`. Figma renders are deterministic, so unchanged
   slides produce identical bytes and don't show up.
7. **Build.** `node scripts/build.mjs`.
8. **Preview.** Serve with `python3 -m http.server 4173 --bind 127.0.0.1` and check desktop (1440)
   and mobile (375) in the Browser pane: changed slides, the videos playing.
   A hidden Browser pane doesn't run animation frames, so take a screenshot before trusting
   IntersectionObserver state.
9. **Publish.** Show the user the list of changed slides, then commit
    (`Update slides 07, 12 from Figma`) and push to `main`. GitHub Pages redeploys in ~1 minute;
    confirm with `gh run list --limit 1`.

## Visuals page

`visuals.html` is built from `visuals.json`: the posts in the Figma section **"visuals and motion"**
(`figma.section`), served from `assets/visuals/`.

- Order is the grid order: group the section's direct children into rows by `y`, then sort by `x`.
  The section contains a second, identical copy of the first three rows stacked on top; keep the
  topmost (later in the metadata) node for each position.
- `h` is the post height (1350 for 4:5, 1080 for square); width is always 1080.
- Stills: `get_screenshot` at the post's own size → `raw/visuals/<n>.png` →
  `scripts/optimize-visuals.sh raw/visuals`.
- Animated posts: don't go by frame names (only some say "ANIMACIJA"), and don't trust
  `get_motion_context` on the whole section — it stops at 500 animated layers and silently drops
  the rest. Instead run a read-only `use_figma` over `section.children` and count descendants whose
  `node.animations` is non-empty; every post with a count > 0 is animated. Each gets
  `"video": true`: `export_video` with `constraint` WIDTH 720
  (full size is 2× the bytes for no visible gain at tile size) → `assets/visuals/<n>.mp4`.
  The still is the poster.

## Gotchas

- Text in Neulis Cursive (Bio Bandits) is a paid font — keep those slides as images/video, don't rebuild them in HTML.
- Screenshot URLs from the Figma MCP expire quickly; download right after each batch.
- Keep `CNAME` in the repo root, or the custom domain is dropped on the next deploy.
