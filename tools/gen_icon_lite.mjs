// gen_icon_lite.mjs : icône Pythie Lite « P L sur fond bleu clair » (demande du
// tireur, L-ARB-15 : le P de Pythie est sur fond noir, le P L de Lite est sur
// fond bleu clair ; l'« Apollon solaire » à douze rayons, consommé depuis
// L-ARB-1, reste consigné en réserve historique). Lettres géométriques sombres
// sur fond bleu clair, même encodage PNG maison (zlib), aucune dépendance :
// même sortie au bit près partout.
// Usage : node gen_icon_lite.mjs [outdir]   (par défaut : répertoire courant)
// Écrit : icon-180.png (écran d'accueil iOS), icon-192.png, icon-512.png (PWA).
import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";

// --- géométrie (coordonnées unitaires, lettres en traits rectangulaires) ---
const W = 0.09;                 // épaisseur de trait
const T = 0.20, B = 0.80;        // sommet et pied des lettres
// P : fût + panse fermée (barre haute, flanc droit, barre médiane)
const P = [
  [0.13, T, 0.13 + W, B],        // fût
  [0.13, T, 0.47, T + W],        // barre haute
  [0.47 - W, T, 0.47, 0.53],     // flanc droit de la panse
  [0.13, 0.53 - W, 0.47, 0.53],  // barre médiane
];
// L : fût + pied
const L = [
  [0.55, T, 0.55 + W, B],        // fût
  [0.55, B - W, 0.87, B],        // pied
];

// --- couleurs (langage Tailwind de l'app) ---
const BG = [186, 230, 253];      // sky-200, « fond bleu clair » du tireur
const LETTRE = [2, 6, 23];      // slate-950, le sombre de l'app

function dans(x, y, rects) {
  for (const [x0, y0, x1, y1] of rects) if (x >= x0 && x <= x1 && y >= y0 && y <= y1) return true;
  return false;
}
function shade(x, y) {
  return dans(x, y, P) || dans(x, y, L) ? LETTRE : BG;
}

function render(size, ss) {
  const px = new Uint8Array(size * size * 3);
  for (let py = 0; py < size; py++) {
    for (let pxi = 0; pxi < size; pxi++) {
      let r = 0, g = 0, b = 0;
      for (let sy = 0; sy < ss; sy++) {
        const y = (py + (sy + 0.5) / ss) / size;
        for (let sx = 0; sx < ss; sx++) {
          const x = (pxi + (sx + 0.5) / ss) / size;
          const c = shade(x, y);
          r += c[0]; g += c[1]; b += c[2];
        }
      }
      const n = ss * ss, i = (py * size + pxi) * 3;
      px[i] = Math.round(r / n); px[i + 1] = Math.round(g / n); px[i + 2] = Math.round(b / n);
    }
  }
  return px;
}

// aperçu ASCII (contrôle de géométrie sans visionneuse)
function preview() {
  const Wp = 72, H = 40;
  for (let row = 0; row < H; row++) {
    let line = "";
    for (let col = 0; col < Wp; col++) {
      const x = (col + 0.5) / Wp, y = (row + 0.5) / H;
      line += dans(x, y, P) || dans(x, y, L) ? "#" : ".";
    }
    console.log(line);
  }
}

// --- PNG : encodeur maison (RGB 8 bits, filtre 0 par ligne) ---
const CRC_T = (() => { const t = new Int32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1); t[n] = c; } return t; })();
function crc32(buf) { let c = -1; for (let i = 0; i < buf.length; i++) c = CRC_T[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ -1) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, "ascii");
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function writePNG(file, size, rgb) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let row = 0; row < size; row++) {
    raw[row * (size * 3 + 1)] = 0;
    Buffer.from(rgb.buffer, row * size * 3, size * 3).copy(raw, row * (size * 3 + 1) + 1);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  fs.writeFileSync(file, Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idat), chunk("IEND", Buffer.alloc(0))]));
}

const outdir = process.argv[2] || ".";
if (outdir === "--preview" || process.argv[3] === "--preview") { preview(); process.exit(0); }
fs.mkdirSync(outdir, { recursive: true });
for (const size of [180, 192, 512]) {
  writePNG(path.join(outdir, `icon-${size}.png`), size, render(size, 4));
  console.log(`icon-${size}.png`);
}
