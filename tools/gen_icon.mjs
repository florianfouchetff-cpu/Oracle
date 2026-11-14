// gen_icon.mjs : icône Pythie « l'œil cible » (le projet : de l'œil à la cible).
// Amande d'œil dont l'iris est une cible à anneaux, point rouge du collimateur
// au centre, graduations aux quatre points, fond sombre de l'app (slate-950).
// Pur Node (zlib), aucune dépendance : même sortie au bit près partout.
// Usage : node gen_icon.mjs [outdir]   (par défaut : répertoire courant)
// Écrit : icon-180.png (écran d'accueil iOS), icon-192.png, icon-512.png (PWA).
import zlib from "node:zlib";
import fs from "node:fs";
import path from "node:path";

// --- géométrie (coordonnées unitaires, centre 0.5/0.5) ---
const EYE = { a: 0.375, b1: 0.235, b2: 0.215, hw: 0.014 }; // amande : demi-largeur, demi-hauteurs sup/inf, demi-trait
const RINGS = [0.130, 0.094, 0.058], RING_HW = 0.0095;      // iris : anneaux de cible
const DOT = 0.030, GLOW = 0.055, GLOW_A = 0.28;             // point rouge + halo
const TICK_IN = 0.150, TICK_OUT = 0.196, TICK_HW = 0.0065;   // graduations cardinales
// --- couleurs (langage Tailwind de l'app) ---
const BG_IN = [13, 27, 42], BG_OUT = [2, 6, 23];  // dégradé radial slate
const LID = [226, 232, 240];                        // slate-200
const CYAN = [34, 211, 238];                       // cyan-400
const RED = [239, 68, 68];                         // rouge collimateur

function inEll(dx, dy, a, b) { return (dx * dx) / (a * a) + (dy * dy) / (b * b) <= 1; }

function shade(x, y) {
  const dx = x - 0.5, dy = y - 0.5;
  const gd = Math.hypot(dx, dy);
  const d = Math.min(1, gd / 0.7071);
  let c = [BG_IN[0] + (BG_OUT[0] - BG_IN[0]) * d, BG_IN[1] + (BG_OUT[1] - BG_IN[1]) * d, BG_IN[2] + (BG_OUT[2] - BG_IN[2]) * d];
  if (gd <= GLOW) { // halo du point rouge (sous les anneaux)
    const a = GLOW_A * (1 - gd / GLOW);
    c = [c[0] + (RED[0] - c[0]) * a, c[1] + (RED[1] - c[1]) * a, c[2] + (RED[2] - c[2]) * a];
  }
  let cyan = false;
  for (const r of RINGS) if (Math.abs(gd - r) <= RING_HW) cyan = true;
  if (dx >= TICK_IN && dx <= TICK_OUT && Math.abs(dy) <= TICK_HW) cyan = true;
  if (dx <= -TICK_IN && dx >= -TICK_OUT && Math.abs(dy) <= TICK_HW) cyan = true;
  if (dy >= TICK_IN && dy <= TICK_OUT && Math.abs(dx) <= TICK_HW) cyan = true;
  if (dy <= -TICK_IN && dy >= -TICK_OUT && Math.abs(dx) <= TICK_HW) cyan = true;
  if (cyan) c = CYAN;
  if (gd <= DOT) c = RED;
  const lid = (dy <= 0 && inEll(dx, dy, EYE.a + EYE.hw, EYE.b1 + EYE.hw) && !inEll(dx, dy, EYE.a - EYE.hw, EYE.b1 - EYE.hw))
    || (dy >= 0 && inEll(dx, dy, EYE.a + EYE.hw, EYE.b2 + EYE.hw) && !inEll(dx, dy, EYE.a - EYE.hw, EYE.b2 - EYE.hw));
  if (lid) c = LID;
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
      const lid = (dy <= 0 && inEll(dx, dy, EYE.a + EYE.hw, EYE.b1 + EYE.hw) && !inEll(dx, dy, EYE.a - EYE.hw, EYE.b1 - EYE.hw))
        || (dy >= 0 && inEll(dx, dy, EYE.a + EYE.hw, EYE.b2 + EYE.hw) && !inEll(dx, dy, EYE.a - EYE.hw, EYE.b2 - EYE.hw));
      const cyan = RINGS.some(r => Math.abs(gd - r) <= RING_HW)
        || (dx >= TICK_IN && dx <= TICK_OUT && Math.abs(dy) <= TICK_HW) || (dx <= -TICK_IN && dx >= -TICK_OUT && Math.abs(dy) <= TICK_HW)
        || (dy >= TICK_IN && dy <= TICK_OUT && Math.abs(dx) <= TICK_HW) || (dy <= -TICK_IN && dy >= -TICK_OUT && Math.abs(dx) <= TICK_HW);
      line += lid ? "#" : (gd <= DOT ? "O" : (cyan ? "+" : (gd <= GLOW ? "·" : " ")));
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
