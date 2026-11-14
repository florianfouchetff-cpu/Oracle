# Pythie · app autonome (v0.80)

Build : 2026-11-14. Source de vérité : le canvas pythie-boucle-v0 (v0.80),
compilé par build_standalone.py (jsx_harness + adaptateur React + Tailwind au build).
Validation du canvas source : B6 107, 82 suites 2200 PASS, 12 scénarios 845, 48 sondes/diag zéro échec (rejeu 2026-11-14).

## Déploiement (GitHub Pages)
1. Créer le dépôt (privé ou public, au choix du tireur) et pousser le contenu de dist/.
2. Settings > Pages > Source : Deploy from a branch > main > root. URL : https://<compte>.github.io/<depot>/.
3. Sur l'iPhone : ouvrir l'URL dans Safari, bouton Partager > « Sur l'écran d'accueil ».

## Ce qui change pour les acquisitions
- GPS : autorisation Safari au premier appel, puis mémorisée par l'app.
- Relevé web : fetch direct au fournisseur, jamais intercepté par le service worker.
- Offline : le shell est caché au premier chargement ; l'app démarre sans réseau
  (doctrine intacte : offline-first, le réseau n'est jamais présumé).

## Reconstruire après chaque version du canvas
python3 build_standalone.py (depuis le dossier pythie) puis re-pousser dist/.
Le sceau (empreinte du shell) est inscrit dans sw.js : tout changement du shell
re-installe le worker chez le tireur et rafraichit le cache, rien a faire d'autre.
