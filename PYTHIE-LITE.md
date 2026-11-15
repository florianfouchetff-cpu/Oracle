# Pythie Lite · app autonome (v0.2)

Build : 2026-11-15. Source de vérité : le canvas pythie-lite-v01 (v0.2),
compilé sans modification du code (Babel JSX classique, React 18 UMD inline,
Tailwind 3.4 compilé au build, aucune dépendance au réseau ni au CDN).
Validation du build standalone : 14 PASS, 0 échec (moteur .308 V₀ 790 / BC G7 0,243
/ zéro 200 m : 15,6 MOA et 521 m/s à 600 m ; 39,3 MOA, 376 m/s, ToF 1,84 s, Mach 1,10
à 1000 m ; vent travers 4 m/s à 600 m = 1,17 mrad, moteur et règle du retard d'accord ;
Coriolis 48,5°N tir à l'est = 0,05 mrad, balle à droite correction à gauche, signes vérifiés ;
ordre page TIR localisation < site < météo).

## Périmètre (doctrine)
- Pythie Lite calcule au doigt, théorique et autoporté : aucune file, aucun
  archivage de tirs, aucune analyse, aucun recours à Delphes ni Pythie.
- Jamais qualifié, jamais source de truing : rien de ce qui sort de Lite
  n'entre dans la chaîne de preuve. Registres locaux setups/cartouches
  (SET-n / C-n) jamais vers Delphes.
- Dérive gyroscopique non calculée (Miller à verrouiller aux sources).
- Registres au localStorage « pythieLite » { v: 2, data }, refus honnête des
  versions inconnues, entrées v0.1 non converties (rien n'était archivé).

## Déploiement (GitHub Pages)
Déjà fait : le dossier lite/ de ce dépôt, servi à …/Oracle/lite/.
Sur l'iPhone : ouvrir l'URL dans Safari, bouton Partager > « Sur l'écran d'accueil ».
L'icône « Apollon solaire » (disque à douze rayons comme la rosace des heures,
cyan de Lite) la distingue de l'œil cible de Pythie.

## Ce qui change pour les acquisitions
- GPS : autorisation Safari au premier appel, puis mémorisée par l'app.
  L'erreur exacte du navigateur est dite (PERMISSION_DENIED et compagnie),
  aucune position n'est jamais devinée.
- Relevé web : fetch direct à Open-Meteo (vent modèle 10 m en information
  seulement, jamais la zone de tir), jamais intercepté par le service worker.
- Offline : le shell est caché au premier chargement ; l'app démarre sans réseau
  (doctrine intacte : offline-first, le réseau n'est jamais présumé).

## Reconstruire après chaque version du canvas
Recompiler depuis le canvas (JSX → createElement, React UMD + Tailwind au build),
mettre à jour lite/index.html et lite/sw.js. Le sceau (empreinte du shell, inscrite
dans sw.js) fait le reste : tout changement du shell re-installe le worker chez le
tireur et rafraichit le cache, rien à faire d'autre.
