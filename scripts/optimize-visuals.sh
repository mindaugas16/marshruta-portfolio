#!/bin/zsh
# Converts Figma PNG exports (NN.png) of the Visuals posts into the WebP sizes the site serves.
# Usage: scripts/optimize-visuals.sh <dir-with-pngs> [NN ...]   (no NN = all)
set -euo pipefail

src=$1; shift
out=${0:A:h:h}/assets/visuals
mkdir -p $out

if (( $# )); then
  files=(${^@}.png)
else
  files=(${(f)"$(cd $src && ls [0-9][0-9].png)"})
fi

for f in $files; do
  n=${f:r}
  cwebp -quiet -q 84 -m 6 $src/$f -o $out/$n.webp
  cwebp -quiet -q 80 -m 6 -resize 540 0 $src/$f -o $out/$n-540.webp
done

du -sh $out
