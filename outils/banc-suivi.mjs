// Banc du suivi du décor : images de synthèse dont on connaît le mouvement exact,
// passées dans LE code de index.html (extrait tel quel). Mesure l'écart de l'ancre en pixels.
// Usage : node outils/banc-suivi.mjs
import fs from "node:fs";
const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const bloc = (debut, fin) => { const i = html.indexOf(debut), j = html.indexOf(fin, i); if (i < 0 || j < 0) throw new Error("bloc absent : " + debut); return html.slice(i, j); };
// estPersonne de la page est remplacé par un détourage imparfait (3 px trop serré : les cheveux dépassent)
const code = bloc("function pyramide(g)", "// ── le choix de l'endroit").replace(/const estPersonne = [^\n]*\n/, "");

const TW = 180, TH = 240;
let graine = 11; const rnd = () => (graine = (graine * 16807) % 2147483647) / 2147483647;
// monde texturé (plus grand que la vue), avec une embrasure sombre
const MW = 400, MH = 420, monde = new Float32Array(MW * MH).fill(120);
for (let k = 0; k < 900; k++) {
  const x0 = rnd() * MW | 0, y0 = rnd() * MH | 0, w = 2 + rnd() * 9 | 0, h = 2 + rnd() * 9 | 0, v = 60 + rnd() * 140;
  for (let y = y0; y < Math.min(MH, y0 + h); y++) for (let x = x0; x < Math.min(MW, x0 + w); x++) monde[y * MW + x] = monde[y * MW + x] * 0.6 + v * 0.4;
}
for (let y = 40; y < 380; y++) for (let x = 80; x < 150; x++) monde[y * MW + x] = 20;
const echM = (x, y) => { x = Math.max(0, Math.min(MW - 1.001, x)); y = Math.max(0, Math.min(MH - 1.001, y)); const x0 = x | 0, y0 = y | 0, fx = x - x0, fy = y - y0, i = y0 * MW + x0; return (monde[i] * (1 - fx) + monde[i + 1] * fx) * (1 - fy) + (monde[i + MW] * (1 - fx) + monde[i + MW + 1] * fx) * fy; };

// la personne : tête + épaules texturées, FIXES dans l'image (elle bouge avec le téléphone)
let avecPersonne = false;
const PERS = { cx: 95, cy: 175, rx: 55, ry: 80 };
const dansPers = (u, v, marge = 0) => ((u - PERS.cx) / (PERS.rx - marge)) ** 2 + ((v - PERS.cy) / (PERS.ry - marge)) ** 2 < 1;
const estPersonne = (x, y) => avecPersonne && dansPers(x, y, 3);
const presPersonne = (x, y) => estPersonne(x, y) || estPersonne(x - 5, y) || estPersonne(x + 5, y) || estPersonne(x, y - 5) || estPersonne(x, y + 5);

// vue : le point (u, v) de l'image montre le monde en o + R(th)·((u, v) − c) + c
const vue = (ox, oy, th, bruit) => {
  const g = new Float32Array(TW * TH), c = Math.cos(th), s = Math.sin(th);
  for (let v = 0; v < TH; v++) for (let u = 0; u < TW; u++) {
    const du = u - TW / 2, dv = v - TH / 2;
    const fond = avecPersonne && dansPers(u, v) ? 70 + 50 * Math.sin(u * 0.7) * Math.cos(v * 0.5) : echM(ox + c * du - s * dv + TW / 2, oy + s * du + c * dv + TH / 2);
    g[v * TW + u] = fond + (rnd() - 0.5) * bruit;
  }
  return g;
};
const versMonde = (u, v, m) => { const c = Math.cos(m.th), s = Math.sin(m.th), du = u - TW / 2, dv = v - TH / 2; return [m.ox + c * du - s * dv + TW / 2, m.oy + s * du + c * dv + TH / 2]; };
const versVue = (wx, wy, m) => { const c = Math.cos(m.th), s = Math.sin(m.th), dx = wx - m.ox - TW / 2, dy = wy - m.oy - TH / 2; return [c * dx + s * dy + TW / 2, -s * dx + c * dy + TH / 2]; };

const { pyramide, suivrePoint, detecterPoints, similarite } =
  new Function("TW", "TH", "estPersonne", code + "\nreturn { pyramide, suivrePoint, detecterPoints, similarite };")(TW, TH, estPersonne);

function essai(nom, mouvement, bruit = 6, images = 90) {
  let m = mouvement(0), pyr = pyramide(vue(m.ox, m.oy, m.th, bruit));
  const ancreRef = [40, 70], ancreMonde = versMonde(ancreRef[0], ancreRef[1], m);
  let pts = detecterPoints(pyr[0], { x0: 0, x1: TW, y0: 0, y1: TH }, 60, []).map(p => [p[0], p[1], p[0], p[1]]);
  let pire = 0, somme = 0, n = 0, perdus = 0;
  for (let k = 1; k <= images; k++) {
    m = mouvement(k);
    const p2 = pyramide(vue(m.ox, m.oy, m.th, bruit));
    const refs = [], cour = [];
    for (const p of pts) { const q = suivrePoint(pyr, p2, p[0], p[1]); if (q && !presPersonne(q[0], q[1])) { refs.push([p[2], p[3]]); cour.push(q); } }
    const T = similarite(refs, cour);
    pyr = p2;
    if (!T) { perdus++; pts = cour.map((q, i) => [q[0], q[1], refs[i][0], refs[i][1]]); continue; }
    const a = [T.c * ancreRef[0] - T.s * ancreRef[1] + T.tx, T.s * ancreRef[0] + T.c * ancreRef[1] + T.ty];
    const vrai = versVue(ancreMonde[0], ancreMonde[1], m);
    const e = Math.hypot(a[0] - vrai[0], a[1] - vrai[1]);
    pire = Math.max(pire, e); somme += e; n++;
    pts = T.inliers.map(i => [cour[i][0], cour[i][1], refs[i][0], refs[i][1]]);
    if (pts.length < 30) {
      const avant = pts.length, nn = T.c * T.c + T.s * T.s;
      pts = detecterPoints(p2[0], { x0: 0, x1: TW, y0: 0, y1: TH }, 60, pts)
        .map((p, i) => i < avant ? p : [p[0], p[1], (T.c * (p[0] - T.tx) + T.s * (p[1] - T.ty)) / nn, (-T.s * (p[0] - T.tx) + T.c * (p[1] - T.ty)) / nn]);
    }
  }
  console.log(`${nom.padEnd(38)} écart moyen ${(somme / Math.max(1, n)).toFixed(2)} px · pire ${pire.toFixed(2)} px · perdues ${perdus}/${images}`);
}

const tri = (k, p) => { const x = (k % (2 * p)) / p; return x < 1 ? x : 2 - x; };
console.log("(pixels de l'image de suivi 180×240 ; ×2 dans la vignette)");
essai("immobile", k => ({ ox: 100, oy: 80, th: 0 }));
essai("panoramique lent (1 px/image)", k => ({ ox: 100 + k, oy: 80, th: 0 }));
essai("haut-bas (1,5 px/image)", k => ({ ox: 100, oy: 80 + 40 * Math.sin(k / 15), th: 0 }));
essai("panoramique rapide (4 px/image)", k => ({ ox: 40 + 160 * tri(k, 40), oy: 80, th: 0 }));
essai("panoramique très rapide (8 px/image)", k => ({ ox: 40 + 160 * tri(k, 20), oy: 80, th: 0 }));
essai("rotation ±3°", k => ({ ox: 100, oy: 80, th: 0.05 * Math.sin(k / 12) }));
essai("main qui bouge", k => ({ ox: 100 + 30 * Math.sin(k / 10), oy: 80 + 18 * Math.sin(k / 7), th: 0.04 * Math.sin(k / 9) }));
essai("main qui bouge, bruit fort", k => ({ ox: 100 + 30 * Math.sin(k / 10), oy: 80 + 18 * Math.sin(k / 7), th: 0.04 * Math.sin(k / 9) }), 16);
avecPersonne = true;
console.log("— personne au premier plan (bouge avec le téléphone, détourage 3 px trop serré) —");
essai("immobile + personne", k => ({ ox: 100, oy: 80, th: 0 }));
essai("main qui bouge + personne", k => ({ ox: 100 + 30 * Math.sin(k / 10), oy: 80 + 18 * Math.sin(k / 7), th: 0.04 * Math.sin(k / 9) }));
essai("panoramique rapide + personne", k => ({ ox: 40 + 160 * tri(k, 40), oy: 80, th: 0 }));
