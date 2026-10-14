#!/usr/bin/env bash
# Prépare un clip Kling (fond vert) pour la page : recadré sur le Watcher au même format que
# les PNG (largeur/hauteur = 158/720), 720 px de haut, H.264 sans son, lecture immédiate.
# Usage : outils/clips.sh source.mp4 assets/watcher_xxx.mp4 X Y L H
#   X Y L H = zone du Watcher dans la vidéo source (en pixels), déjà au bon rapport.
set -euo pipefail
src="$1"; out="$2"; x="$3"; y="$4"; w="$5"; h="$6"
ffmpeg -y -v error -i "$src" -an \
  -vf "crop=${w}:${h}:${x}:${y},scale=158:720:flags=lanczos,format=yuv420p" \
  -c:v libx264 -profile:v baseline -level 3.1 -crf 18 -preset slow -movflags +faststart "$out"
echo "$out"
