// gen_icon_lite.mjs : icône Pythie Lite « Apollon solaire » (la piste consignée
// en réserve d'icône dès l'arbitrage L-ARB-1 : identité propre, distincte de
// l'œil cible de Pythie). Disque solaire, douze rayons comme la rosace des
// heures de la page TIR, accent cyan de Pythie Lite, fond sombre de l'app.
// Pur Node (zlib), aucune dépendance : même sortie au bit près partout.
// Usage : node gen_icon_lite.mjs [outdir]   (par défaut : répertoire courant)
// Écrit : icon-180.png (écran d'accueil iOS), icon-192.png, icon-512.png (PWA).
import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";

// --- géométrie (coordonnées unitaires, centre 0.5/0.5) ---
const DISC = 0.150;                                  // disque solaire
const RAY_IN = 0.200, RAY_OUT = 0.300, RAY_HW = 0.011; // douze rayons, rosace des heures
const RING_IN = 0.055, RING_OUT = 0.078;             // anneau sombre interne (réticule)
const DOT = 0.040, GLOW = 0.210, GLOW_A = 0.16;      // centre + halo
const N_RAYONS = 12;                                 // 12 h de la rosace

// --- couleurs (langage Tailwind de l'app) ---
const BG_IN = [13, 27, 42], BG_OUT = [2, 6, 23];  // dégradé radial slate
const CYAN = [34, 211, 238];                        // cyan-400, accent de Pythie Lite
const DARK = [2, 6, 23];                            // slate-950, anneau interne

function shade(x, y) {
  const dx = x - 0.5, dy = y - 0.5;
  const gd = Math.hypot(dx, dy);
  const d = Math.min(1, gd / 0.7071);
  let c = [BG_IN[0] + (BG_OUT[0] - BG_IN[0]) * d, BG_IN[1] + (BG_OUT[1] - BG_IN[1]) * d, BG_IN[2] + (BG_OUT[2] - BG_IN[2]) * d];
  if (gd <= GLOW) { // halo du disque (sous les rayons)
    const a = GLOW_A * (1 - gd / GLOW);
    c = [c[0] + (CYAN[0] - c[0]) * a, c[1] + (CYAN[1] - c[1]) * a, c[2] + (CYAN[2] - c[2]) * a];
  }
  // rayons : angle horaire de la rosace (12 h en haut)
  const th = Math.atan2(dx, -dy); // 0 = 12 h, croissant horaire
  for (let i = 0; i < N_RAYONS; i++) {
    const a = (i * 2 * Math.PI) / N_RAYONS;
    let da = th - a;
    while (da > Math.PI) da -= 2 * Math.PI;
    while (da < -Math.PI) da += 2 * Math.PI;
    const dist = Math.abs(da) * gd; // distance latérale à l'axe du rayon
    if (gd >= RAY_IN && gd <= RAY_OUT && dist <= RAY_HW) c = CYAN;
  }
  if (gd <= DISC) c = CYAN;
  if (gd >= RING_IN && gd <= RING_OUT) c = DARK;
  if (gd <= DOT) c = CYAN;
  return c;
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
  const W = 72, H = 36;
  for (let row = 0; row < H; row++) {
    let line = "";
    for (let col = 0; col < W; col++) {
      const x = (col + 0.5) / W, y = (row + 0.5) / H;
      const dx = x - 0.5, dy = y - 0.5, gd = Math.hypot(dx, dy);
      const th = Math.atan2(dx, -dy);
      let rayon = false;
      for (let i = 0; i < N_RAYONS; i++) {
        const a = (i * 2 * Math.PI) / N_RAYONS;
        let da = th - a;
        while (da > Math.PI) da -= 2 * Math.PI;
        while (da < -Math.PI) da += 2 * Math.PI;
        if (gd >= RAY_IN && gd <= RAY_OUT && Math.abs(da) * gd <= RAY_HW * 1.6) rayon = true;
      }
      line += gd <= DOT ? "O" : (gd >= RING_IN && gd <= RING_OUT) ? " " : (gd <= DISC ? "#" : (rayon ? "|" : (gd <= GLOW ? "·" : " ")));
    }
    console.log(line);
  }
}

// --- PNG : encodeur maison (RGBA 8 bits, filtre 0 par ligne) ---
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
