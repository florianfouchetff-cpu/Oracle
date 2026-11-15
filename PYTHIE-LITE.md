# Pythie Lite · app autonome (v0.3)

Build : 2026-11-15. Source de vérité : le canvas pythie-lite-v01 (v0.3),
compilé sans modification du code (Babel JSX classique, React 18 UMD inline,
Tailwind 3.4 compilé au build, aucune dépendance au réseau ni au CDN).
Validation du build standalone : 28 PASS, 0 échec (moteur .308 V0 790 / BC G7 0,243
/ zero 200 m : 15,6 MOA et 521 m/s a 600 m ; 39,3 MOA, 376 m/s, ToF 1,84 s, Mach 1,10
a 1000 m ; vent travers 4 m/s a 600 m = 1,17 mrad, moteur et regle du retard d'accord ;
Coriolis 48,5N tir a l'est = 0,05 mrad, balle a droite correction a gauche ; boussole
iOS/Android/non absolu, inclinometre montant/descendant/sans capteur ; ordre page TIR
localisation < site < meteo).

## Perimetre (doctrine)
- Pythie Lite calcule au doigt, theorique et autoporte : aucune file, aucun
  archivage de tirs, aucune analyse, aucun recours a Delphes ni Pythie.
- Jamais qualifie, jamais source de truing : rien de ce qui sort de Lite
  n'entre dans la chaine de preuve. Registres locaux setups/cartouches
  (SET-n / C-n) jamais vers Delphes.
- Derive gyroscopique non calculee (Miller a verrouiller aux sources).
- Registres au localStorage « pythieLite » { v: 2, data }, refus honnete des
  versions inconnues, entrees v0.1 non converties (rien n'etait archive).

## Deploiement (GitHub Pages)
Deja fait : le dossier lite/ de ce depot, servi a .../Oracle/lite/.
Sur l'iPhone : ouvrir l'URL dans Safari, bouton Partager > « Sur l'ecran d'accueil ».
L'icone « Apollon solaire » (disque a douze rayons comme la rosace des heures,
cyan de Lite) la distingue de l'oeil cible de Pythie.

## Ce qui change pour les acquisitions
- GPS : autorisation Safari au premier appel, puis memorisee par l'app.
  L'erreur exacte du navigateur est dite (PERMISSION_DENIED et compagnie),
  aucune position n'est jamais devinee.
- Boussole et inclinometre (v0.3) : doctrine de la visee Pythie, telephone a la
  bouche du canon, ecran vers le ciel, haut vers la cible : une posture, deux
  lectures (azimut par la boussole, pente bouche-cible par le plateau). Le
  capteur propose en continu, le tireur valide au degre ; permission iOS
  demandee dans le geste ; cap non absolu refuse honnetement ; replis
  honnetes, jamais devine.
- Releve web : fetch direct a Open-Meteo (vent modele 10 m en information
  seulement, jamais la zone de tir), jamais intercepte par le service worker.
- Offline : le shell est cache au premier chargement ; l'app demarre sans reseau
  (doctrine intacte : offline-first, le reseau n'est jamais presume).

## Reconstruire apres chaque version du canvas
Recompiler depuis le canvas (JSX -> createElement, React UMD + Tailwind au build),
mettre a jour lite/index.html et lite/sw.js. Le sceau (empreinte du shell, inscrite
dans sw.js) fait le reste : tout changement du shell re-installe le worker chez le
tireur et rafraichit le cache, rien a faire d'autre.
