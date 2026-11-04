#!/bin/zsh
# Converts Figma PNG exports (NN.png) into the WebP sizes the site serves.
# Usage: scripts/optimize-slides.sh <dir-with-pngs> [NN ...]   (no NN = all)
set -euo pipefail

src=$1; shift
out=${0:A:h:h}/assets/slides
mkdir -p $out

if (( $# )); then
  files=(${^@}.png)
else
  files=(${(f)"$(cd $src && ls [0-9][0-9].png)"})
fi

for f in $files; do
  n=${f:r}
  cwebp -quiet -q 86 -m 6 $src/$f -o $out/$n.webp
  cwebp -quiet -q 82 -m 6 -resize 960 0 $src/$f -o $out/$n-960.webp
done

du -sh $out
