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
};

export const hasFigure = (name: string) => name in figures;
