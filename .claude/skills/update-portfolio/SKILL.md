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
| `"html": "partials/…"` | hand-built HTML (cover, about) | `get_design_context` of the frame |

`n` is a stable file id, **not** the position. Order comes from the array order. A new slide gets the
next unused number; a removed slide's number is never reused.

## Steps

1. **Open the file.** Read `slides.json` for `figma.fileKey`, then `create_session` with it.
2. **List frames.** `get_metadata` on page `0:1`. The output is large; save it and extract the
   top-level `<frame>`/`<instance>` lines that are 1920×1080 and not `hidden`, sorted by `y`.
   Diff against `slides.json`: new node ids, missing node ids, order changes.
   If slides were added or removed, show the user the diff and wait for a yes before continuing.
3. **Find animation.** Run `get_motion_context` (recursive) on every new frame and on any frame whose
   name contains "anim". A non-empty `timelineCohorts` means the slide is animated → `"video": true`.
   A frame that lost its animation goes back to a plain slide (delete its mp4).
4. **Export stills.** `get_screenshot` (maxDimension 1920) for every slide, including video and html
   slides (their stills are the poster / change reference). Download each to
   `raw/export/<n>.png` (`raw/` is gitignored), then run
   `scripts/optimize-slides.sh raw/export`.
5. **Export videos.** `export_video` (quality `high`, fps 30) on each video slide's frame — for an
   instance, the instance itself is the root. Download to `assets/video/<n>.mp4` before
   `availableUntil`. Check length with `mdls -name kMDItemDurationSeconds`.
6. **See what changed.** `git status --short assets/`. Figma renders are deterministic, so unchanged
   slides produce identical bytes and don't show up.
7. **HTML slides.** If `assets/slides/01.webp` or `02.webp` changed, run `get_design_context` on that
   frame and carry the text/layout change into `partials/0N-*.html` and `assets/site.css`
   (values there are Figma pixels × `--u`). Download any new images to `assets/img/` as WebP.
   Check the phone layout too (container query ≤ 760px).
8. **Build.** `node scripts/build.mjs`.
9. **Preview.** Serve with `python3 -m http.server 4173 --bind 127.0.0.1` and check desktop (1440)
   and mobile (375) in the Browser pane: changed slides, the about ring, the videos playing.
   A hidden Browser pane doesn't run animation frames, so take a screenshot before trusting
   IntersectionObserver state.
10. **Publish.** Show the user the list of changed slides, then commit
    (`Update slides 07, 12 from Figma`) and push to `main`. GitHub Pages redeploys in ~1 minute;
    confirm with `gh run list --limit 1`.

## Gotchas

- Text in Neulis Cursive (Bio Bandits) is a paid font — keep those slides as images/video, don't rebuild them in HTML.
- Screenshot URLs from the Figma MCP expire quickly; download right after each batch.
- Keep `CNAME` in the repo root, or the custom domain is dropped on the next deploy.
