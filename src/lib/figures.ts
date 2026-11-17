// Illustrative line drawings, one per sheet, keyed by slug. Each returns SVG markup for a 780x700 canvas.
// Conventions: 2px outlines, thinner detail lines (stroke-width 1–1.4), dashed centre/connection lines,
// numbered balloons via `balloon()`. Class "hl" marks the one or two elements drawn in the highlight colour.

export const K = 0.577; // isometric ellipse ratio
export const f = (n: number) => n.toFixed(1);
export const ellipse = (x: number, y: number, r: number, extra = '') =>
  `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${f(r * K)}" ${extra}/>`;
export const lower = (x: number, y: number, r: number) =>
  `<path d="M${x - r} ${y}A${r} ${f(r * K)} 0 0 0 ${x + r} ${y}"/>`;
export const cylinder = (x: number, y: number, r: number, h: number) =>
  ellipse(x, y, r) + `<path d="M${x - r} ${y}v${h}M${x + r} ${y}v${h}"/>` + lower(x, y + h, r);
export const at = (x: number, y: number, r: number, a: number) =>
  `${f(x + r * Math.cos(a))} ${f(y + r * K * Math.sin(a))}`;
/** Isometric box: (x, y) is the back corner of the top face; w runs right-down, d left-down, h is height. */
export function box(x: number, y: number, w: number, d: number, h: number, extra = '') {
  const B = [x + 0.866 * w, y + 0.5 * w] as const;
  const C = [B[0] - 0.866 * d, B[1] + 0.5 * d] as const;
  const D = [x - 0.866 * d, y + 0.5 * d] as const;
  return `<path ${extra} d="M${x} ${y}L${B}L${C}L${D}Z M${D}v${h}L${C[0]} ${C[1] + h}L${B[0]} ${B[1] + h}V${B[1]} M${C}v${h}"/>`;
}
/** Numbered balloon at (bx, by) with a leader line to (lx, ly). */
export const balloon = (n: number, bx: number, by: number, lx: number, ly: number) => {
  const dx = lx - bx, dy = ly - by, len = Math.hypot(dx, dy) || 1;
  return `<path d="M${f(bx + (dx / len) * 17)} ${f(by + (dy / len) * 17)}L${lx} ${ly}" stroke-width="1"/><circle class="hl" cx="${bx}" cy="${by}" r="17"/><text class="hl" x="${bx}" y="${by + 5}" text-anchor="middle">${n}</text>`;
};

type Pt = readonly [number, number];
type Proj = (u: number, v: number, z?: number) => Pt;
const pp = (p: Pt) => `${f(p[0])} ${f(p[1])}`;
/** Path from a `d` string; `extra` carries attributes such as class or stroke-width. */
const D = (d: string, extra = '') => (d ? `<path ${extra ? extra + ' ' : ''}d="${d}"/>` : '');
/** `d` fragment for a polyline. */
const dl = (p: readonly Pt[], close = false) => `M${p.map(pp).join('L')}${close ? 'Z' : ''}`;
const pl = (p: readonly Pt[], extra = '', close = false) => D(dl(p, close), extra);
const circ = (x: number, y: number, r: number, extra = '') => `<circle ${extra ? extra + ' ' : ''}cx="${f(x)}" cy="${f(y)}" r="${r}"/>`;
const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
const T1 = 'stroke-width="1"';
const T14 = 'stroke-width="1.4"';
const DASH = 'stroke-width="1" stroke-dasharray="5 5"';
/** Isometric projection with origin (ox, oy): u runs right-down, v left-down, z up. */
const isoAt = (ox: number, oy: number): Proj => (u, v, z = 0) => [ox + (u - v) * 0.866, oy + (u + v) * 0.5 - z];
/** Points of a horizontal circle of radius r projected through P. */
const isoRing = (P: Proj, u: number, v: number, z: number, r: number, n = 48): Pt[] =>
  Array.from({ length: n }, (_, i) => P(u + r * Math.cos((i / n) * 2 * Math.PI), v + r * Math.sin((i / n) * 2 * Math.PI), z));
/** Visible edges and screen silhouette (for hidden-line clipping) of an isometric box. */
function isoBox(P: Proj, u: number, v: number, z: number, W: number, Dp: number, H: number) {
  const t = z + H;
  const [aT, bT, cT, dT] = [P(u, v, t), P(u + W, v, t), P(u + W, v + Dp, t), P(u, v + Dp, t)];
  const [bB, cB, dB] = [P(u + W, v, z), P(u + W, v + Dp, z), P(u, v + Dp, z)];
  const lines: Pt[][] = [[aT, bT, cT, dT, aT], [bT, bB, cB, dB, dT], [cT, cB]];
  return { lines, hull: [aT, bT, bB, cB, dB, dT] as Pt[] };
}
/** Parameter intervals of segment a→b left visible after subtracting convex screen polygons. */
function visible(a: Pt, b: Pt, hulls: readonly (readonly Pt[])[]) {
  let parts: [number, number][] = [[0, 1]];
  const dx = b[0] - a[0], dy = b[1] - a[1];
  for (const h of hulls) {
    let area = 0;
    h.forEach((p, i) => { const q = h[(i + 1) % h.length]!; area += p[0] * q[1] - q[0] * p[1]; });
    const sg = area > 0 ? 1 : -1;
    let t0 = 0, t1 = 1, out = false;
    h.forEach((p, i) => {
      if (out) return;
      const q = h[(i + 1) % h.length]!, ex = q[0] - p[0], ey = q[1] - p[1], len = Math.hypot(ex, ey) || 1;
      const nx = (-ey * sg) / len, ny = (ex * sg) / len;
      const c = nx * (a[0] - p[0]) + ny * (a[1] - p[1]) - 0.8, k = nx * dx + ny * dy; // 0.8px inward margin keeps edges on the silhouette
      if (Math.abs(k) < 1e-9) { if (c <= 0) out = true; return; }
      if (k > 0) t0 = Math.max(t0, -c / k); else t1 = Math.min(t1, -c / k);
    });
    if (out || t0 >= t1) continue;
    parts = parts.flatMap(([s, e]): [number, number][] => {
      if (t1 <= s || t0 >= e) return [[s, e]];
      const r: [number, number][] = [];
      if (t0 > s) r.push([s, t0]);
      if (t1 < e) r.push([t1, e]);
      return r;
    });
  }
  return parts.filter(([s, e]) => e - s > 1e-3);
}
/** `d` fragment for polylines with the parts hidden behind `hulls` removed. */
function hd(lines: readonly (readonly Pt[])[], hulls: readonly (readonly Pt[])[] = []) {
  let d = '';
  for (const p of lines) {
    let last: Pt | null = null;
    for (let i = 0; i < p.length - 1; i++) {
      const a = p[i]!, b = p[i + 1]!;
      for (const [s, e] of visible(a, b, hulls)) {
        const m = lerp(a, b, s), n = lerp(a, b, e);
        if (!last || Math.hypot(m[0] - last[0], m[1] - last[1]) > 0.05) d += `M${pp(m)}`;
        d += `L${pp(n)}`;
        last = n;
      }
    }
  }
  return d;
}
const closed = (p: readonly Pt[]) => [...p, p[0]!];
/** Convex hull (monotone chain) of screen points, for use as an occluder. */
function hull(points: readonly Pt[]) {
  const p = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Pt, a: Pt, b: Pt) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const half = (src: Pt[]) => src.reduce<Pt[]>((h, q) => {
    while (h.length >= 2 && cross(h[h.length - 2]!, h[h.length - 1]!, q) <= 0) h.pop();
    h.push(q);
    return h;
  }, []);
  const lo = half(p), up = half([...p].reverse());
  return [...lo.slice(0, -1), ...up.slice(0, -1)];
}
/** Rounded coordinates for balloon leader targets. */
const xy = (p: Pt) => [Math.round(p[0]), Math.round(p[1])] as const;
/** Arrow head at `tip`, pointing away from `from`. */
const head = (tip: Pt, from: Pt, size = 11) => {
  const a = Math.atan2(tip[1] - from[1], tip[0] - from[0]);
  return `M${pp([tip[0] - size * Math.cos(a - 0.42), tip[1] - size * Math.sin(a - 0.42)])}L${pp(tip)}L${pp([tip[0] - size * Math.cos(a + 0.42), tip[1] - size * Math.sin(a + 0.42)])}`;
};
/** Neural network: nodes as circles, all inter-layer links batched into one thin path. */
function net(xs: readonly number[], counts: readonly number[], cy: number, gap: number, r: number, nodeExtra: (layer: number, i: number) => string = () => '') {
  const L = counts.map((n, i) => Array.from({ length: n }, (_, j): Pt => [xs[i]!, cy + (j - (n - 1) / 2) * gap]));
  let d = '';
  for (let i = 0; i < L.length - 1; i++) {
    for (const a of L[i]!) for (const b of L[i + 1]!) {
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
      d += dl([[a[0] + (dx / l) * r, a[1] + (dy / l) * r], [b[0] - (dx / l) * r, b[1] - (dy / l) * r]]);
    }
  }
  let s = D(d, T1);
  L.forEach((layer, i) => layer.forEach((p, j) => { s += circ(p[0], p[1], r, nodeExtra(i, j)); }));
  return { s, nodes: L };
}
/** Fighter planform (top view), nose up, ~300 wide and ~340 long at scale 1. */
function jet(cx: number, cy: number, sc: number, rot: number) {
  const half: Pt[] = [[0, -170], [7, -148], [13, -118], [17, -78], [19, -30], [150, 38], [152, 58], [24, 72], [22, 100], [78, 138], [80, 156], [18, 150], [12, 166], [0, 166]];
  const tf = ([x, y]: Pt): Pt => [cx + sc * (x * Math.cos(rot) - y * Math.sin(rot)), cy + sc * (x * Math.sin(rot) + y * Math.cos(rot))];
  const outline = [...half, ...half.slice(1, -1).reverse().map(([x, y]): Pt => [-x, y])].map(tf);
  const canopy = Array.from({ length: 32 }, (_, i): Pt => [8 * Math.cos((i / 32) * 2 * Math.PI), -108 + 24 * Math.sin((i / 32) * 2 * Math.PI)]).map(tf);
  const detail = ([[[0, -78], [0, 140]], [[40, 66], [132, 56]], [[-40, 66], [-132, 56]], [[12, 98], [12, 146]], [[-12, 98], [-12, 146]]] as const).map((l) => l.map(tf));
  const xs = outline.map((p) => p[0]), ys = outline.map((p) => p[1]);
  const s = pl(outline, '', true) + pl(canopy, T14, true) + D(detail.map((l) => dl(l)).join(''), T1);
  return { s, box: [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)] as const };
}

export const figures: Record<string, () => string> = {
  // IRIS smart gas vent, exploded: grille, iris diaphragm, fan, duct housing, solar panel, controller, battery.
  'iris-smart-gas-ventilation'() {
    const cx = 250;
    let s = `<path d="M${cx} 24V690" stroke-width="1" stroke-dasharray="16 6 3 6"/>`;
    s += ellipse(cx, 104, 140) + lower(cx, 116, 140) + ellipse(cx, 104, 118);
    for (const t of [-0.6, -0.3, 0, 0.3, 0.6]) {
      const y = 104 + t * 118 * K;
      const w = 118 * Math.sqrt(1 - t * t);
      s += `<path d="M${f(cx - w)} ${f(y)}H${f(cx + w)}" stroke-width="1.4"/>`;
    }
    s += ellipse(cx, 244, 140) + ellipse(cx, 244, 44, 'class="hl"');
    for (let i = 0; i < 8; i++) {
      const a = (i * Math.PI) / 4;
      s += `<path d="M${at(cx, 244, 140, a)}Q${at(cx, 244, 112, a + 1)} ${at(cx, 244, 44, a + 2)}" stroke-width="1.4"/>`;
    }
    s += ellipse(cx, 384, 140) + ellipse(cx, 384, 126) + ellipse(cx, 384, 20);
    for (let i = 0; i < 5; i++) {
      const a = i * Math.PI * 0.4;
      s += `<path d="M${at(cx, 384, 20, a)}L${at(cx, 384, 112, a + 0.15)}Q${at(cx, 384, 128, a + 0.6)} ${at(cx, 384, 104, a + 0.95)}L${at(cx, 384, 20, a + 0.7)}" stroke-width="1.4"/>`;
    }
    s += cylinder(cx, 512, 140, 58) + ellipse(cx, 584, 172) + lower(cx, 594, 172);
    for (const a of [0.5, 2.64, 3.64, 5.78]) {
      s += `<ellipse cx="${f(cx + 156 * Math.cos(a))}" cy="${f(584 + 156 * K * Math.sin(a))}" rx="7" ry="4"/>`;
    }
    s += box(560, 60, 150, 96, 8);
    for (const t of [1 / 3, 2 / 3]) {
      s += `<path d="M${f(560 + 0.866 * 150 * t)} ${f(60 + 0.5 * 150 * t)}l${f(-0.866 * 96)} ${f(0.5 * 96)}" stroke-width="1"/>`;
    }
    s += `<path d="M${f(560 - 0.866 * 48)} ${f(60 + 0.5 * 48)}l${f(0.866 * 150)} ${f(0.5 * 150)}" stroke-width="1"/>`;
    s += box(566, 286, 150, 96, 7) + box(566, 310, 74, 26, 7) + cylinder(600, 372, 17, -20);
    s += box(580, 470, 96, 54, 34);
    s += `<path d="M604 184V292M604 432V478M482 384H392" stroke-width="1" stroke-dasharray="5 5"/>`;
    s += balloon(1, 60, 104, 110, 104) + balloon(2, 60, 244, 110, 244) + balloon(3, 60, 384, 110, 384) + balloon(4, 60, 540, 110, 540);
    s += balloon(5, 736, 96, 694, 120) + balloon(6, 736, 340, 700, 350) + balloon(7, 736, 520, 676, 524);
    return s;
  },

  // YOLO detection: browser window framing two aircraft planforms, each inside a detection box.
  'aircraft-detection'() {
    let s = `<rect x="90" y="90" width="600" height="530" rx="10"/>` + D('M90 130H690', T14);
    s += circ(112, 110, 5, T14) + circ(130, 110, 5, T14) + circ(148, 110, 5, T14);
    s += `<rect x="175" y="100" width="330" height="20" rx="10" stroke-width="1.4"/>` + D('M650 104h22M650 110h22M650 116h22', T14);
    const detect = (b: readonly [number, number, number, number], m: number, L: number, extra: string) => {
      const [x0, y0, x1, y1] = [b[0] - m, b[1] - m, b[2] + m, b[3] + m];
      const frame = `<rect x="${f(x0)}" y="${f(y0)}" width="${f(x1 - x0)}" height="${f(y1 - y0)}" stroke-width="1"/>`;
      const t = `M${f(x0)} ${f(y0 + L)}V${f(y0)}H${f(x0 + L)}M${f(x1 - L)} ${f(y0)}H${f(x1)}V${f(y0 + L)}M${f(x1)} ${f(y1 - L)}V${f(y1)}H${f(x1 - L)}M${f(x0 + L)} ${f(y1)}H${f(x0)}V${f(y1 - L)}`;
      return { s: frame + D(t, extra), x0, y0, x1, y1 };
    };
    const big = jet(330, 395, 1, 0), small = jet(588, 262, 0.36, -0.45);
    const bb = detect(big.box, 16, 30, 'class="hl" stroke-width="3"'), sb = detect(small.box, 10, 16, 'stroke-width="2.4"');
    s += big.s + small.s + bb.s + sb.s;
    // label tab on the main detection
    s += `<rect x="${f(bb.x0)}" y="${f(bb.y0 - 22)}" width="84" height="22" stroke-width="1.4"/>` + D(`M${f(bb.x0 + 10)} ${f(bb.y0 - 11)}h40M${f(bb.x0 + 58)} ${f(bb.y0 - 11)}h16`, T14);
    // detections list panel
    let list = 'M545 380H665';
    for (let i = 0; i < 3; i++) list += `M545 ${400 + i * 30}h12v12h-12ZM567 ${406 + i * 30}h${84 - i * 22}`;
    s += D(list, T14);
    s += balloon(1, 50, 110, 90, 110) + balloon(2, 50, 250, bb.x0, 250) + balloon(3, 50, 433, 180, 433) + balloon(4, 728, 262, sb.x1, 262);
    return s;
  },

  // Dormitory stock tool: isometric shelving with boxes, linked to a row in the desktop app's table.
  'inventory-management-system'() {
    const P = isoAt(146, 482), W = 240, Dp = 60, t = 8, levels = [20, 145, 270, 395] as const;
    const slabs = levels.map((z) => isoBox(P, 0, 0, z, W, Dp, t));
    const spec = [[0, 40, 100, 48], [0, 125, 182, 40], [1, 60, 175, 55], [2, 40, 92, 40], [2, 118, 182, 50], [3, 70, 150, 46]] as const;
    const boxes = spec.map(([l, a, b, h]) => {
      const z = levels[l] + t, g = isoBox(P, a, 6, z, b - a, Dp - 12, h);
      const label: Pt[] = [P(a + 8, Dp - 6, z + h * 0.35), P(a + 30, Dp - 6, z + h * 0.35), P(a + 30, Dp - 6, z + h * 0.65), P(a + 8, Dp - 6, z + h * 0.65)];
      return { l, a, b, h, z, g, detail: [[P(a, Dp / 2, z + h), P(b, Dp / 2, z + h)], closed(label)] };
    });
    let s = '';
    slabs.forEach((sl, i) => { s += D(hd(sl.lines, boxes.filter((b) => b.l === i).map((b) => b.g.hull))); });
    const HL = 2;
    boxes.forEach((b, i) => {
      const occ = [...boxes.filter((o) => o.l === b.l && o.a > b.a).map((o) => o.g.hull), ...(slabs[b.l + 1] ? [slabs[b.l + 1]!.hull] : [])];
      const extra = i === HL ? 'class="hl"' : '';
      s += D(hd(b.g.lines, occ), extra) + D(hd(b.detail, occ), extra + (extra ? ' ' : '') + T1);
    });
    const top = levels[3] + t;
    s += D(dl([P(0, Dp, 0), P(0, Dp, top)]) + dl([P(W, Dp, 0), P(W, Dp, top)]) + dl([P(W, 0, 0), P(W, 0, top)]));
    s += D(hd([[P(0, 0, 0), P(0, 0, top)]], [...slabs.map((x) => x.hull), ...boxes.map((b) => b.g.hull)]));
    // desktop window with a stock table
    s += `<rect x="396" y="190" width="290" height="320" rx="8"/>` + D('M396 216H686', T14);
    s += circ(412, 203, 4, T1) + circ(426, 203, 4, T1) + circ(440, 203, 4, T1);
    s += `<rect x="408" y="228" width="44" height="18" rx="3" stroke-width="1.4"/><rect x="458" y="228" width="44" height="18" rx="3" stroke-width="1.4"/><rect x="590" y="228" width="84" height="18" rx="9" stroke-width="1.4"/>`;
    s += `<rect x="408" y="260" width="266" height="202" stroke-width="1.4"/>`;
    let g = 'M408 282H674M448 260V462M568 260V462M618 260V462';
    for (let r = 1; r < 6; r++) g += `M408 ${282 + r * 30}H674`;
    for (let r = 0; r < 6; r++) {
      const y = 297 + r * 30, w = [62, 44, 76, 52, 68, 40][r]!;
      g += `M416 ${y}h20M456 ${y}h${w}M576 ${y}h${18 + (r % 3) * 6}M626 ${y}h${30 - (r % 2) * 10}`;
    }
    for (const x of [416, 456, 576, 626]) g += `M${x} 271h${x === 456 ? 50 : 22}`;
    s += D(g, T1);
    s += `<rect class="hl" x="403" y="339" width="276" height="36" rx="4"/>`;
    const hb = boxes[HL]!, from = P(hb.b, Dp / 2, hb.z + hb.h / 2);
    s += `<path d="M${pp(from)}C${f(from[0] + 90)} ${f(from[1])} 330 357 403 357" ${DASH}/>`;
    const d1 = P(0, Dp, 50);
    s += balloon(1, 55, d1[1] + 30, d1[0], d1[1]) + balloon(2, 55, 330, P(70, Dp - 6, hb.z + 30)[0], P(70, Dp - 6, hb.z + 30)[1]);
    s += balloon(3, 728, 203, 686, 203) + balloon(4, 728, 357, 679, 357) + balloon(5, 55, 140, P(90, Dp - 6, top + 30)[0], P(90, Dp - 6, top + 30)[1]);
    return s;
  },

  // Damage-grade model: cracked building over a seismogram, feeding a network with three output grades.
  'earthquake-damage-prediction'() {
    const P = isoAt(180, 392), W = 110, Dp = 90, H = 250;
    const b = isoBox(P, 0, 0, 0, W, Dp, H);
    let s = D(hd([closed([P(-25, -25), P(W + 25, -25), P(W + 25, Dp + 25), P(-25, Dp + 25)])], [b.hull]), T14);
    s += D(hd(b.lines));
    const left = (a: number, z: number) => P(a, Dp, z), right = (a: number, z: number) => P(W, a, z);
    const win = (q: (a: number, z: number) => Pt, a0: number, a1: number, z: number) => dl([q(a0, z), q(a1, z), q(a1, z + 20), q(a0, z + 20)], true);
    let det = '';
    for (let z = 50; z < H; z += 50) det += dl([P(0, Dp, z), P(W, Dp, z), P(W, 0, z)]);
    for (let z = 0; z < H; z += 50) {
      for (const u of [14, 47, 80]) if (z > 0 || u !== 47) det += win(left, u, u + 16, z + 16);
      for (const v of [10, 62]) det += win(right, v, v + 18, z + 16);
    }
    det += dl([left(46, 0), left(46, 34), left(64, 34), left(64, 0)]);
    s += D(det, T1);
    const ck = (pts: readonly (readonly [number, number])[]) => dl(pts.map(([v, z]) => right(v, z)));
    s += D(ck([[45, H], [39, 226], [50, 203], [42, 178], [53, 150], [44, 124], [55, 98], [47, 72]]) + ck([[42, 178], [32, 166]]) + ck([[53, 150], [59, 136]]), 'stroke-width="1.8"');
    // seismogram at the base
    let w = '';
    for (let x = 70; x <= 330; x += 1.5) {
      const t = (x - 70) / 260;
      const amp = t < 0.15 ? 2 + (4 * t) / 0.15 : 26 * Math.exp(-(t - 0.3) * 3.2) * Math.min(1, (t - 0.15) / 0.1);
      w += `${x === 70 ? 'M' : 'L'}${f(x)} ${f(582 - amp * Math.sin(t * 75))}`;
    }
    s += D(w, T14);
    const n = net([440, 525, 610, 695], [4, 5, 5, 3], 342, 58, 13, (l, i) => (l === 3 && i === 0 ? 'class="hl"' : ''));
    s += n.s + circ(695, 284, 20, 'class="hl" stroke-width="1"');
    s += `<path d="M288 307C350 307 380 342 412 342M338 582C392 582 396 402 412 342" ${DASH}/>` + D('M413 335L424 342L413 349');
    s += balloon(1, 60, 172, ...xy(P(0, Dp, 215))) + balloon(2, 340, 182, ...xy(right(50, 203))) + balloon(3, 60, 522, 82, 578);
    s += balloon(4, 525, 132, 525, 200) + balloon(5, 725, 187, 704, 266);
    return s;
  },

  // E-Seed: quadcopter scanning contoured terrain and dropping self-burying seeds on an erosion hotspot.
  'e-seed-autonomous-reforestation'() {
    const OX = 360, P = isoAt(OX, 400), S = 260, PD = isoAt(OX + 180, 150);
    let s = pl([P(0, 0), P(S, 0), P(S, S), P(0, S)], '', true);
    let c = '';
    for (let i = 0; i < 5; i++) {
      const R = 14 + i * 21, z = (4 - i) * 13;
      c += dl(closed(Array.from({ length: 72 }, (_, k): Pt => {
        const a = (k / 72) * 2 * Math.PI, r = R * (1 + 0.13 * Math.sin(2 * a + i * 0.4 + 1) + 0.06 * Math.cos(3 * a - 0.5));
        return P(115 + r * Math.cos(a), 135 + r * Math.sin(a), z);
      })));
    }
    s += D(c, T14);
    const tg: Pt = P(228, 58);
    s += pl(closed(isoRing(P, 228, 58, 0, 24)), 'class="hl"') + pl(closed(isoRing(P, 228, 58, 0, 10)), 'class="hl"');
    s += D(dl([P(198, 58), P(258, 58)]) + dl([P(228, 28), P(228, 88)]), T1);
    // drone
    const body = isoBox(PD, -28, -28, 0, 56, 56, 18);
    const ends: Pt[] = [[78, 0], [-78, 0], [0, 78], [0, -78]];
    s += D(hd(ends.map(([u, v]) => [PD(Math.sign(u) * 28, Math.sign(v) * 28, 9), PD(u, v, 9)]), [body.hull]), 'stroke-width="2.4"');
    s += D(hd(body.lines));
    for (const [u, v] of ends) {
      const [x, y] = PD(u, v, 9);
      s += cylinder(x, y - 12, 7, 12) + ellipse(x, y - 16, 38, T1) + D(`M${at(x, y - 16, 34, 0.6)}L${at(x, y - 16, 34, 0.6 + Math.PI)}`, T14);
    }
    const sx = OX + 180, sy = PD(28, 28, 0)[1];
    s += D(`M${sx - 10} ${f(sy - 1)}V${f(sy + 14)}M${sx + 10} ${f(sy - 1)}V${f(sy + 14)}`) + lower(sx, +f(sy + 14), 10) + ellipse(sx, +f(sy + 20), 4, T1);
    const cone = sy + 26;
    s += `<path d="M${sx} ${f(cone)}L${pp(P(0, S))}M${sx} ${f(cone)}L${pp(P(S, 0))}" ${DASH}/>`;
    // seeds falling to the target
    const top: Pt = [sx - 2, cone + 6], bot: Pt = [tg[0], tg[1] - 22];
    s += `<path d="M${pp(top)}L${pp(bot)}" stroke-width="1" stroke-dasharray="2 6"/>`;
    for (const t of [0.3, 0.55, 0.8]) {
      const [x, y] = lerp(top, bot, t);
      s += `<ellipse cx="${f(x - 14)}" cy="${f(y)}" rx="5" ry="11" stroke-width="1.8"/>` + D(dl(Array.from({ length: 25 }, (_, i): Pt => [x - 14 + 5 * Math.sin(i * 0.8), y - 11 - i * 1.4])), T14);
    }
    s += balloon(1, 722, 70, ...xy(PD(36, -78, 25)));
    s += balloon(2, sx - 150, 250, sx - 11, +f(sy + 10)) + balloon(3, 80, 560, ...xy(P(0, 200)));
    s += balloon(4, 720, 340, ...xy(lerp([sx - 14 + 5, cone + 6], [tg[0] - 14 + 5, tg[1] - 22], 0.55)));
    s += balloon(5, 720, 570, ...xy(P(252, 58)));
    return s;
  },

  // AIPTS: ICU bed with a vitals sensor, ESP8266 controller board, ECG trace and a phone alert.
  'aipts-ai-icu-patient-monitoring'() {
    const P = isoAt(200, 385), W = 260, Dp = 120;
    const mat = isoBox(P, 0, 0, 70, W, Dp, 30), frame = isoBox(P, 0, 0, 56, W, Dp, 14);
    const headb = isoBox(P, -10, 0, 30, 10, Dp, 140), foot = isoBox(P, W, 0, 30, 8, Dp, 92);
    const pillow = isoBox(P, 14, 16, 100, 58, Dp - 32, 14), sensor = isoBox(P, 165, 48, 100, 26, 22, 9);
    let s = D(hd(headb.lines, [mat.hull, frame.hull]));
    const legs = ([[8, 8], [W - 8, 8], [W - 8, Dp - 8], [8, Dp - 8]] as const).map(([u, v]) => [P(u, v, 0), P(u, v, 56)]);
    s += D(hd(legs, [frame.hull, mat.hull, foot.hull]), 'stroke-width="2.4"');
    s += D(hd(frame.lines, [mat.hull, foot.hull])) + D(hd(mat.lines, [foot.hull])) + D(hd(foot.lines));
    s += D(hd([closed([P(W + 8, 16, 46), P(W + 8, Dp - 16, 46), P(W + 8, Dp - 16, 108), P(W + 8, 16, 108)])]), T1);
    s += D(hd([[P(130, 0, 100), P(130, Dp, 100), P(130, Dp, 70)]], [foot.hull]), T1);
    s += D(hd(pillow.lines), T14) + D(hd(sensor.lines)) + pl(closed(isoRing(P, 178, 59, 109, 4, 16)), T1);
    // ECG monitor trace
    s += `<rect x="85" y="70" width="400" height="110" rx="8" stroke-width="1.4"/>`;
    let e = '';
    for (let x = 100; x <= 470; x++) {
      const p = ((x - 100) % 92) / 92, g = (m: number, sd: number) => Math.exp(-(((p - m) / sd) ** 2));
      const v = 0.12 * g(0.2, 0.035) - 0.12 * g(0.36, 0.012) + g(0.4, 0.014) - 0.25 * g(0.44, 0.014) + 0.22 * g(0.68, 0.06);
      e += `${x === 100 ? 'M' : 'L'}${x} ${f(150 - 62 * v)}`;
    }
    s += D(e, 'class="hl"');
    const sTop = P(178, 59, 112);
    s += `<path d="M${pp(sTop)}V180" ${DASH}/>`;
    // controller board with chip, pins and meander antenna
    const B = isoAt(560, 470), board = isoBox(B, 0, 0, 0, 120, 75, 6), chip = isoBox(B, 18, 22, 6, 36, 30, 8);
    s += D(hd(board.lines)) + D(hd(chip.lines), T14);
    let pins = '';
    for (let u = 12; u < 120; u += 12) pins += dl([B(u, 75, 0), B(u, 75, -7)]);
    const mz: Pt[] = [];
    for (let k = 0; k < 6; k++) mz.push(B(k % 2 ? 114 : 96, 12 + k * 10, 6), B(k % 2 ? 96 : 114, 12 + k * 10, 6));
    s += D(pins + dl(mz), T1);
    const sR = P(191, 59, 104), ant: Pt = B(105, 40, 6);
    s += `<path d="M${pp(sR)}C420 350 500 420 ${pp(B(0, 36, 6))}M${pp(ant)}C${f(ant[0] + 30)} 470 650 380 650 312" ${DASH}/>`;
    let arcs = '';
    for (const r of [16, 28]) arcs += `M${f(ant[0] + 30 - r * 0.64)} ${f(ant[1] - 30 - r * 0.77)}A${r} ${r} 0 0 1 ${f(ant[0] + 30 + r * 0.64)} ${f(ant[1] - 30 - r * 0.77)}`;
    s += D(arcs, T14);
    // phone with alert card
    s += `<rect x="595" y="100" width="110" height="205" rx="16"/><rect x="605" y="122" width="90" height="166" rx="4" stroke-width="1.4"/>`;
    s += `<rect x="612" y="140" width="76" height="46" rx="6" stroke-width="1.4"/>` + pl([[628, 150], [641, 174], [615, 174]], 'class="hl"', true);
    s += D('M640 111h20M628 158v8M628 169v1M648 156h32M648 168h22M614 210h72M614 226h50M614 242h62M635 296h30', T1);
    s += balloon(1, 55, 440, ...xy(P(0, Dp, 62))) + balloon(2, 400, 290, ...xy(P(182, 59, 112)));
    s += balloon(3, 720, 600, ...xy(B(120, 40, 3))) + balloon(4, 55, 125, 85, 125) + balloon(5, 728, 210, 705, 210);
    return s;
  },

  // Impact pipeline: region map with roads, epicentre rings, blocked routes and intervention centres.
  'ai-earthquake-impact-analysis-intervention'() {
    const cx = 390, cy = 350, RX = 258, RY = 226;
    const m = (a: number) => 1 + 0.07 * Math.sin(3 * a + 0.5) + 0.04 * Math.cos(5 * a + 1.2) + 0.025 * Math.sin(8 * a);
    const bnd = (deg: number, k = 1): Pt => {
      const a = (deg * Math.PI) / 180;
      return [cx + RX * k * m(a) * Math.cos(a), cy + RY * k * m(a) * Math.sin(a)];
    };
    const curve = (a: Pt, b: Pt, bend: number, n = 48): Pt[] => {
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy);
      const c: Pt = [(a[0] + b[0]) / 2 - (dy / l) * bend, (a[1] + b[1]) / 2 + (dx / l) * bend];
      return Array.from({ length: n + 1 }, (_, i): Pt => {
        const t = i / n;
        return [(1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0], (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1]];
      });
    };
    let s = pl(Array.from({ length: 145 }, (_, i) => bnd(i * 2.5)));
    const A = curve(bnd(192), bnd(12), 30), B = curve(bnd(100), bnd(284), -25);
    s += D(dl(A) + dl(B), 'stroke-width="2.4"');
    s += D(dl(curve(bnd(150), bnd(55), 20)) + dl(curve(bnd(232), bnd(335), 28)) + dl(closed(Array.from({ length: 72 }, (_, i) => bnd(i * 5, 0.45)))), T14);
    s += D([78, 160, 250, 352, 40].map((a) => dl([bnd(a, 0.45), bnd(a + 6)])).join(''), T1);
    const E: Pt = [300, 282];
    s += D([28, 58, 92, 130].map((r) => `M${E[0] - r} ${E[1]}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`).join(''), T1);
    s += circ(E[0], E[1], 6) + D(`M${E[0] - 14} ${E[1]}h28M${E[0]} ${E[1] - 14}v28`, T14);
    const near = (pts: readonly Pt[], r: number) => pts.reduce((best, p) => (Math.abs(Math.hypot(p[0] - E[0], p[1] - E[1]) - r) < Math.abs(Math.hypot(best[0] - E[0], best[1] - E[1]) - r) ? p : best));
    const x1 = near(A, 75), x2 = near(B, 75);
    s += D([x1, x2].map(([x, y]) => `M${f(x - 10)} ${f(y - 10)}l20 20M${f(x + 10)} ${f(y - 10)}l-20 20`).join(''), 'stroke-width="3"');
    const centres = [bnd(62, 0.45), bnd(132, 0.45), bnd(318, 0.62)];
    s += D(centres.map(([x, y]) => `M${f(x - 12)} ${f(y - 12)}h24v24h-24ZM${f(x)} ${f(y - 7)}v14M${f(x - 7)} ${f(y)}h14`).join(''), 'class="hl"');
    s += balloon(1, 70, 90, ...xy(bnd(222))) + balloon(2, 722, 470, ...xy(A[44]!)) + balloon(3, 190, 70, E[0] - 4, E[1] - 6);
    s += balloon(4, 70, 470, ...xy(x1)) + balloon(5, 722, 120, ...xy([centres[2]![0] + 12, centres[2]![1] - 12]));
    return `<g transform="translate(0 40)">${s}</g>`;
  },

  // Physics graphs: a ball rolling down an incline, feeding position, velocity and energy plots.
  'ai-powered-physics-graph-generator'() {
    const A: Pt = [80, 510], B: Pt = [390, 510], C: Pt = [80, 270];
    const d: Pt = [0.791, 0.612], n: Pt = [0.612, -0.791];
    const on = (t: number, off: number): Pt => [C[0] + d[0] * 392 * t + n[0] * off, C[1] + d[1] * 392 * t + n[1] * off];
    let s = pl([A, B, C], '', true);
    let h = 'M60 510H412M80 496h14v14';
    for (let x = 74; x <= 404; x += 20) h += `M${x} 510l-10 12`;
    s += D(h + `M335 510A55 55 0 0 1 ${f(390 - 55 * 0.791)} ${f(510 - 55 * 0.612)}`, T1);
    const ball = on(0.36, 26), ghost = on(0.08, 26);
    s += circ(ball[0], ball[1], 26) + circ(ball[0], ball[1], 3, T14) + `<circle cx="${f(ghost[0])}" cy="${f(ghost[1])}" r="26" stroke-width="1"/>`;
    const a0 = on(0.46, 62), a1 = on(0.72, 62);
    s += D(dl([a0, a1]) + head(a1, a0, 13));
    s += circ(412, 370, 4, T14) + `<path d="${[175, 345, 515].map((y) => `M416 370L458 ${y}`).join('')}" ${DASH}/>` + D([175, 345, 515].map((y) => head([466, y], [416, 370], 9)).join(''), T14);
    for (const [k, yb] of [130, 300, 470].entries()) {
      const y0 = yb + 100;
      s += D(`M480 ${yb - 6}V${y0}H698` + head([480, yb - 8], [480, y0], 9) + head([700, y0], [480, y0], 9), T14);
      const curve = (fn: (t: number) => number) => dl(Array.from({ length: 41 }, (_, i): Pt => [490 + i * 4.7, y0 - 8 - 88 * fn(i / 40)]));
      if (k === 0) s += D(curve((t) => t * t), 'class="hl" stroke-width="2.4"');
      if (k === 1) s += D(curve((t) => t));
      if (k === 2) s += D(curve((t) => t * t) + curve((t) => 1 - t * t));
      s += `<text x="462" y="${yb + 8}" text-anchor="middle">${['X', 'V', 'E'][k]}</text>`;
    }
    s += balloon(1, 120, 190, ...xy(on(0.30, 46))) + balloon(2, 230, 600, 230, 490) + balloon(3, 330, 290, ...xy(lerp(a0, a1, 0.5)));
    s += balloon(4, 728, 140, 678, 140) + balloon(5, 728, 320, 678, 320) + balloon(6, 728, 500, 678, 500);
    return `<g transform="translate(-8 -18)">${s}</g>`;
  },

  // Duray: weekly menu grid, compartment tray and a balance scale.
  'duray-school-nutrition-planner'() {
    const gx = 152, cw = 68, gy = 66, rh = 34;
    let s = `<rect x="${gx}" y="${gy}" width="${7 * cw}" height="${22 + 4 * rh}"/>`;
    let g = `M${gx} ${gy + 22}h${7 * cw}`;
    for (let r = 1; r < 4; r++) g += `M${gx} ${gy + 22 + r * rh}h${7 * cw}`;
    for (let c = 1; c < 7; c++) g += `M${gx + c * cw} ${gy}v${22 + 4 * rh}`;
    for (let c = 0; c < 7; c++) g += `M${gx + c * cw + 24} ${gy + 11}h20`;
    const marks = [[1, 0, 1, 0, 1, 0, 0], [1, 1, 1, 1, 1, 0, 0], [0, 1, 0, 2, 0, 0, 0], [2, 0, 1, 0, 2, 0, 0]];
    let mk = '';
    marks.forEach((row, r) => row.forEach((v, c) => {
      const x = gx + c * cw + cw / 2, y = gy + 22 + r * rh + rh / 2;
      if (v === 1) mk += `M${x - 9} ${y}l5 6l12 -12`;
      if (v === 2) mk += `M${x - 4} ${y}a4 4 0 1 0 8 0a4 4 0 1 0 -8 0`;
      if (c >= 5) g += `M${x - 20} ${y + 10}l40 -20`;
    }));
    s += D(g, T1) + D(mk, 'stroke-width="1.8"');
    s += `<rect class="hl" x="${gx - 5}" y="${gy + 22 + rh - 5}" width="${7 * cw + 10}" height="${rh + 10}" rx="4"/>`;
    // tray with rounded compartments
    const P = isoAt(230, 330), W = 250, Dp = 160, H = 18;
    s += D(hd(isoBox(P, 0, 0, 0, W, Dp, H).lines)) + pl(closed([P(10, 10, H), P(W - 10, 10, H), P(W - 10, Dp - 10, H), P(10, Dp - 10, H)]), T14);
    const rr = (u0: number, v0: number, u1: number, v1: number, r = 10): Pt[] => {
      const c: [number, number, number][] = [[u1 - r, v0 + r, -Math.PI / 2], [u1 - r, v1 - r, 0], [u0 + r, v1 - r, Math.PI / 2], [u0 + r, v0 + r, Math.PI]];
      return c.flatMap(([u, v, a]) => Array.from({ length: 7 }, (_, i) => P(u + r * Math.cos(a + (i / 6) * (Math.PI / 2)), v + r * Math.sin(a + (i / 6) * (Math.PI / 2)), H)));
    };
    const cup = P(199, 109, H), cupHull = hull([...isoRing(P, 199, 109, H, 21.2), ...isoRing(P, 199, 109, H + 34, 21.2)]);
    s += D(hd([[18, 18, 84, 66], [94, 18, 160, 66], [170, 18, 232, 66], [18, 76, 156, 142], [166, 76, 232, 142]].map(([a, b, c, e]) => closed(rr(a!, b!, c!, e!))), [cupHull]), T14);
    s += cylinder(cup[0], cup[1] - 34, 26, 34) + ellipse(cup[0], cup[1] - 34, 21, T1);
    // balance scale
    const tilt = 0.09, L: Pt = [600 - 100 * Math.cos(tilt), 380 + 100 * Math.sin(tilt)], R: Pt = [600 + 100 * Math.cos(tilt), 380 - 100 * Math.sin(tilt)];
    s += D(dl([L, R]), 'stroke-width="2.4"') + circ(600, 380, 6) + D('M600 386V588M545 600H655L642 588H558ZM594 370L600 356L606 370');
    let pans = '';
    for (const [x, y] of [L, R]) pans += `M${f(x)} ${f(y)}L${f(x - 32)} ${f(y + 90)}M${f(x)} ${f(y)}L${f(x + 32)} ${f(y + 90)}M${f(x - 38)} ${f(y + 90)}Q${f(x)} ${f(y + 124)} ${f(x + 38)} ${f(y + 90)}Z`;
    s += D(pans, T14) + circ(L[0], L[1] + 82, 12) + D(`M${f(L[0])} ${f(L[1] + 70)}l3 -8M${f(R[0] - 14)} ${f(R[1] + 92)}h28l-5 -20h-18Z`);
    s += balloon(1, 70, 110, gx, 110) + balloon(2, 728, gy + 22 + rh * 1.5, gx + 7 * cw + 5, gy + 22 + rh * 1.5);
    s += balloon(3, 60, 440, ...xy(P(0, Dp, 9))) + balloon(4, 420, 285, ...xy([cup[0] + 22, cup[1] - 40])) + balloon(5, 728, 300, ...xy(R));
    return `<g transform="translate(0 16)">${s}</g>`;
  },

  // Piezo wheelchair: side elevation with the seat cushion exploded to show its piezo disk grid feeding LED strips.
  'piezo-powered-wheelchair-visibility'() {
    const [wx, wy] = [290, 480];
    let s = circ(wx, wy, 128) + circ(wx, wy, 118, T14) + circ(wx, wy, 106, T1) + circ(wx, wy, 14) + circ(130 + 400, 580, 30) + circ(530, 580, 6, T1);
    let sp = '';
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6 + 0.13;
      sp += `M${f(wx + 14 * Math.cos(a))} ${f(wy + 14 * Math.sin(a))}L${f(wx + 118 * Math.cos(a))} ${f(wy + 118 * Math.sin(a))}`;
    }
    s += D(sp + 'M130 610H600', T1);
    s += D('M262 372H508M262 372L240 168H200M318 372V298Q318 290 326 290H440Q448 290 448 298V372M505 372L515 545L530 580M496 384L566 530M556 532L616 524M290 480L278 372M290 480L512 470', 'stroke-width="2.4"');
    s += D('M262 382H505M249 186Q266 280 263 364', T14);
    // exploded cushion with piezo disks
    const PC = isoAt(400, 118), W = 200, Dp = 120, H = 22;
    s += D(hd(isoBox(PC, 0, 0, 0, W, Dp, H).lines));
    let disks = '', wires = '';
    for (const v of [26, 60, 94]) {
      for (const u of [32, 78, 124, 170]) {
        disks += dl(closed(isoRing(PC, u, v, H, 13, 28)));
        if (u < 170) wires += dl([PC(u + 13, v, H), PC(u + 33, v, H)]);
      }
    }
    s += D(disks, 'class="hl"') + D(wires, T1);
    const c0 = PC(0, Dp, 0), c1 = PC(W, Dp, 0);
    s += `<path d="M${f(c0[0])} ${f(c0[1] + 6)}V366M${f(c1[0])} ${f(c1[1] + 6)}V366" ${DASH}/>`;
    // LED strip on the backrest, wired from the cushion
    const dir: Pt = [-22 / 205, -204 / 205], nrm: Pt = [-dir[1], dir[0]];
    const along = (t: number, off: number): Pt => [262 + dir[0] * 205 * t - nrm[0] * off, 372 + dir[1] * 205 * t - nrm[1] * off];
    s += pl([along(0.25, 5), along(0.85, 5), along(0.85, 14), along(0.25, 14)], T14, true);
    let leds = '', rays = '';
    for (let i = 0; i < 4; i++) {
      const [x, y] = along(0.33 + i * 0.15, 9.5);
      leds += `M${f(x - 2.5)} ${f(y)}a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0 -5 0`;
      for (const da of [-0.5, 0, 0.5]) rays += `M${f(x - 13 * Math.cos(da))} ${f(y + 13 * Math.sin(da))}l${f(-14 * Math.cos(da))} ${f(14 * Math.sin(da))}`;
    }
    s += D(leds, T1) + D(rays, 'class="hl" stroke-width="1.6"');
    const wEnd = along(0.25, 9.5), wStart = PC(10, Dp, 0);
    s += D(`M${pp(wStart)}C${f(wStart[0])} ${f(wStart[1] + 75)} ${f(wEnd[0] + 18)} ${f(wEnd[1] + 14)} ${f(wEnd[0] + 3)} ${f(wEnd[1] + 3)}`, T14);
    s += balloon(1, 700, 250, ...xy(PC(W, 60, 11))) + balloon(2, 640, 70, ...xy(PC(183, 26, 22))) + balloon(3, 150, 160, ...xy([wStart[0] - 4, wStart[1] + 42]));
    s += balloon(4, 110, 290, ...xy([along(0.55, 34)[0], along(0.55, 34)[1]])) + balloon(5, 110, 530, 166, 510) + balloon(6, 640, 600, 558, 588);
    return `<g transform="translate(-14 14)">${s}</g>`;
  },

  // About page: robotics, data analysis, software and AI as four stages in sequence.
  journey() {
    const link = (a: Pt, b: Pt, w: number, ra: number, rb: number) => {
      const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy), ux = dx / l, uy = dy / l, nx = -uy * (w / 2), ny = ux * (w / 2);
      return [1, -1].map((k) => `M${f(a[0] + ux * ra + k * nx)} ${f(a[1] + uy * ra + k * ny)}L${f(b[0] - ux * rb + k * nx)} ${f(b[1] - uy * rb + k * ny)}`).join('');
    };
    // 1 robot arm
    const J0: Pt = [110, 408], J1: Pt = [166, 322], J2: Pt = [80, 266];
    let s = D('M48 460H172M62 460L72 438H148L158 460M94 438V422H126V438');
    s += circ(J0[0], J0[1], 14) + circ(J1[0], J1[1], 11) + circ(J2[0], J2[1], 8) + D(link(J0, J1, 16, 14, 11) + link(J1, J2, 12, 11, 8));
    s += D('M66 280H94M66 280l-4 22l7 7M94 280l4 22l-7 7M80 274V280', T14);
    // 2 bar and line chart
    let ch = 'M236 268V460H366' + head([236, 264], [236, 460], 9) + head([370, 460], [236, 460], 9);
    const hs = [70, 115, 90, 150], tops: Pt[] = [];
    hs.forEach((h, i) => { const x = 250 + i * 28; ch += `M${x} 460V${460 - h}H${x + 18}V460`; tops.push([x + 9, 460 - h - 22]); });
    s += D(ch, T14) + D(dl(tops) + tops.map(([x, y]) => `M${x - 4} ${y}a4 4 0 1 0 8 0a4 4 0 1 0 -8 0`).join(''));
    // 3 code window
    s += `<rect x="418" y="282" width="140" height="164" rx="8"/>` + D('M418 304H558M432 293h1M442 293h1M452 293h1M436 412h46M436 428h72M500 334l-14 54', T14);
    s += D('M470 342L450 362L470 382M516 342L536 362L516 382', 'stroke-width="2.6"');
    // 4 neural network
    s += net([628, 680, 732], [3, 4, 2], 364, 38, 10, () => 'class="hl"').s;
    // dashed hand-offs between stages
    s += `<path d="M186 364H214M380 364H404M570 364H602" ${DASH}/>` + D(head([218, 364], [186, 364], 9) + head([408, 364], [380, 364], 9) + head([606, 364], [570, 364], 9), T14);
    s += balloon(1, 110, 506, 110, 462) + balloon(2, 300, 506, 300, 462) + balloon(3, 488, 506, 488, 448) + balloon(4, 680, 506, 680, 433);
    return `<g transform="translate(0 -40)">${s}</g>`;
  },

  // Contact page: isometric envelope with flap open and letter rising, sending to a relay tower.
  contact() {
    const P = isoAt(250, 400), W = 250, Dp = 160;
    const env = isoBox(P, 0, 0, 0, W, Dp, 6);
    const lt: Pt[] = [P(8, 10, 40), P(118, 10, 40), P(118, 10, 232), P(8, 10, 232)];
    const M = P(W / 2, Dp * 0.55, 6);
    let s = D(hd([[P(0, 0, 6), P(W / 2, -20, 150), P(W, 0, 6)]], [lt])) + D(hd(env.lines, [lt]));
    s += D(hd([[P(0, Dp, 6), M, P(W, Dp, 6)], [P(0, 0, 6), M, P(W, 0, 6)]], [lt]), T14);
    s += pl(lt, '', true);
    let tx = '';
    for (const [z, u1] of [[204, 96], [188, 104], [172, 80], [144, 100], [128, 92], [112, 64]] as const) tx += dl([P(24, 10, z), P(u1, 10, z)]);
    s += D(tx, T1);
    // relay tower
    const xl = (y: number) => 598 + ((600 - y) / 350) * 35, xr = (y: number) => 682 - ((600 - y) / 350) * 35;
    let tw = 'M598 600L633 250M682 600L647 250M585 600H695M628 250H652M640 250V196';
    s += D(tw);
    tw = '';
    for (let i = 0; i < 6; i++) {
      const y0 = 600 - i * 58.3, y1 = y0 - 58.3;
      tw += `M${f(xl(y0))} ${f(y0)}L${f(xr(y1))} ${f(y1)}M${f(xr(y0))} ${f(y0)}L${f(xl(y1))} ${f(y1)}M${f(xl(y1))} ${f(y1)}H${f(xr(y1))}`;
    }
    s += D(tw, T1) + circ(640, 190, 5);
    let arcs = '';
    for (const r of [18, 32, 46]) {
      const c = Math.cos(0.6) * r, sn = Math.sin(0.6) * r;
      arcs += `M${f(640 + c)} ${f(190 - sn)}A${r} ${r} 0 0 1 ${f(640 + c)} ${f(190 + sn)}M${f(640 - c)} ${f(190 + sn)}A${r} ${r} 0 0 1 ${f(640 - c)} ${f(190 - sn)}`;
    }
    s += D(arcs, 'class="hl"');
    const st = P(118, 10, 244);
    s += `<path d="M${pp(st)}Q500 100 580 176" ${DASH}/>`;
    s += balloon(1, 60, 530, ...xy(P(0, Dp, 3))) + balloon(2, 545, 420, ...xy(lerp(P(W, 0, 6), P(W / 2, -20, 150), 0.45)));
    s += balloon(3, 130, 230, ...xy(P(8, 10, 200))) + balloon(4, 420, 90, 470, 147) + balloon(5, 728, 470, ...xy([xr(470), 470]));
    s += balloon(6, 728, 120, ...xy([640 + Math.cos(0.4) * 46, 190 - Math.sin(0.4) * 46]));
    return s;
  },
};

export const hasFigure = (name: string) => name in figures;
