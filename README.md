# Visio Halloween — Watcher V1.1

Une seule question : quand la cible voit, dans sa propre vignette, quelque chose derrière elle, se retourne-t-elle ?

V1.1 (14/10/2026) : le Watcher n'est plus « collé à l'écran ».
- **Accroché au décor** : à 10 s, la page choisit un bord vertical du décor (chambranle, meuble, angle) avec un côté sombre, puis suit des points du décor image après image (Lucas-Kanade pyramidal + similarité RANSAC, référence fixe). Le téléphone bouge, le Watcher bouge avec la pièce.
- **À peine visible** : seule une tête + un bout d'épaule dépassent du côté sombre (20-35 % du personnage), basse résolution, bruit fort, contraste écrasé, traînée de compression.
- **Chronologie** : 12-13,5 s tête basse, peu sortie ; 16-17,5 s un peu plus sortie, regard caméra ; disparition nette. Pas de son, pas de gros plan, pas de lumière qui vacille, pas d'écran noir.

Liens :
- `index.html` : organisateur ; `?r=<salle>` : la cible.
- `?solo&suivi` : test de l'accroche sur un seul téléphone (croix rouge sur l'ancre, points verts suivis, apparitions en boucle toutes les 6 s).
- `&taille=1.5`, `&lum=1.5` : taille et visibilité de la tête. `&debug` : mesures (l'organisateur voit l'état de la cible).

Vrai humain filmé (prioritaire sur le Watcher Kling) : déposer `assets/humain_a.mp4` (2 s, tête baissée) et `assets/humain_b.mp4` (1 s, la tête se relève et regarde la caméra), fond vert, cadrés tête + épaules.

Banc du suivi : `node outils/banc-suivi.mjs` (images de synthèse au mouvement connu, écart de l'ancre en pixels).
