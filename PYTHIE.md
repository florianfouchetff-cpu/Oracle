# Pythie · app autonome (v0.91)

Build : 2026-11-15. Source de vérité : le canvas pythie-boucle-v0 (v0.91),
compilé par build_standalone.py (jsx_harness + adaptateur React + Tailwind au build).
Validation du canvas source : B6 107, 93 suites 2426 PASS, 12 scénarios, 59 sondes/diag zéro échec (rejeu 2026-11-15).

## Déploiement (GitHub Pages)
1. Créer le dépôt (privé ou public, au choix du tireur) et pousser le contenu de dist/.
2. Settings > Pages > Source : Deploy from a branch > main > root. URL : https://<compte>.github.io/<depot>/.
3. Sur l'iPhone : ouvrir l'URL dans Safari, bouton Partager > « Sur l'écran d'accueil ».

## Ce qui change pour les acquisitions
- GPS : autorisation Safari au premier appel, puis mémorisée par l'app.
- Relevé web : fetch direct au fournisseur, jamais intercepté par le service worker.
- Offline : le shell est caché au premier chargement ; l'app démarre sans réseau
  (doctrine intacte : offline-first, le réseau n'est jamais présumé).

## Icône « l'œil cible »
Iris en cible à anneaux, point rouge du collimateur au centre, amande d'œil,
fond sombre de l'app. Générée par tools/gen_icon.mjs (pur Node, aucune
dépendance, déterministe) ; la GitHub Action gen-icons.yml la régénère et la
commet automatiquement à chaque changement du générateur. icon-180.png sert à
l'écran d'accueil iOS, icon-192 et icon-512 au manifeste PWA.

## Reconstruire après chaque version du canvas
python3 build_standalone.py (depuis le dossier pythie) puis re-pousser dist/.
Le sceau (empreinte du shell) est inscrit dans sw.js : tout changement du shell
re-installe le worker chez le tireur et rafraichit le cache, rien a faire d'autre.
