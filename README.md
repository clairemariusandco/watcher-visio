# Visio Halloween — Watcher V0

Une seule question : quand la cible voit le Watcher derrière elle dans sa propre vignette, se retourne-t-elle ?

- `index.html` : organisateur (crée l'appel, envoie le lien).
- `index.html?r=<salle>` : la cible. Le Watcher apparaît dans **sa** vignette locale de 10 à 18 s après la connexion, puis disparaît net. Le correspondant reçoit le flux caméra brut.
- `?solo` : test sur un seul téléphone, sans appel (bouton « Rejouer »).
- `&debug` : images/s, état de la segmentation, mesures de la pièce, événements.

Pastille en haut à gauche chez l'organisateur : rouge = Watcher visible chez la cible, cercle = disparu, jaune = annulé (pas de place derrière la personne ou détourage incertain).

Pile : WebRTC via PeerJS (serveur public, TURN PeerJS inclus), segmentation MediaPipe `selfie_segmenter`, canvas 2D. Pas de backend, pas de compte, pas de paiement.

Assets : `outils/detourer.ps1` détoure les PNG fond vert de Téléchargements. `watcher3.png` (gros plan) est réservé au jumpscare, non utilisé en V0.
