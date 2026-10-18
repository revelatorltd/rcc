/**
 * INVENTED LOGOS for the enterprise's tenants — each label its own, so a list of them reads as
 * labels and not as a wall of initials.
 *
 * The system ships invented marks for a few dozen organizations, and the enterprise holds three
 * hundred tenants: reusing the few would give two labels one logo. So each tenant's logo is made
 * from its name, the same every time — a style, a palette and a glyph picked by the name's hash —
 * until the system ships stock label marks as it ships stock covers and faces (gaps.md).
 *
 * A logo is content, like a cover: drawn into an image the tenant's mark holds, never into the page.
 */

/** Ink on ground — deep, printable pairs a label would choose. */
const PALETTES: readonly [ground: string, ink: string][] = [
  ["#1F2A44", "#F3E9D2"],
  ["#1E4D3A", "#CDEBD6"],
  ["#6B1E2E", "#F6D5D8"],
  ["#2B2B2B", "#F2B544"],
  ["#2541B2", "#FFFFFF"],
  ["#B5532E", "#F7E6D3"],
  ["#0F5257", "#F4F1E8"],
  ["#4B2E5A", "#E5D4F0"],
  ["#111111", "#FFFFFF"],
  ["#E3B23C", "#1A1A1A"],
  ["#55602A", "#F1EED9"],
  ["#E4572E", "#1C1C28"],
  ["#F4F1E8", "#1F2A44"],
  ["#D7263D", "#FFF5E6"],
];

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const hashOf = (text: string) => {
  let hash = 2166136261;
  for (const char of text) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619) >>> 0;
  return hash;
};

const escape = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** The letters a label is known by — its words' first letters, two at most, & kept where it joins. */
const initialsOf = (name: string) => {
  const words = name.split(/\s+/).filter((one) => /[A-Za-z0-9]/.test(one));
  return words
    .slice(0, 2)
    .map((one) => one[0]!.toUpperCase())
    .join("");
};

/** A small mark a label sets beside its letters — a record, a wave, a star, a moon, a diamond. */
const glyph = (kind: number, ink: string, ground: string, cx: number, cy: number, r: number) => {
  switch (kind % 6) {
    case 0: // a record
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${ink}" stroke-width="${r / 6}"/><circle cx="${cx}" cy="${cy}" r="${r / 2.6}" fill="${ink}"/>`;
    case 1: // a sound wave
      return [-2, -1, 0, 1, 2]
        .map((at) => {
          const h = r * (1.6 - Math.abs(at) * 0.45);
          return `<rect x="${cx + at * r * 0.42 - r * 0.13}" y="${cy - h / 2}" width="${r * 0.26}" height="${h}" rx="${r * 0.13}" fill="${ink}"/>`;
        })
        .join("");
    case 2: { // a star
      const points = Array.from({ length: 10 }, (_, at) => {
        const angle = (Math.PI / 5) * at - Math.PI / 2;
        const length = at % 2 ? r * 0.45 : r;
        return `${(cx + Math.cos(angle) * length).toFixed(2)},${(cy + Math.sin(angle) * length).toFixed(2)}`;
      });
      return `<polygon points="${points.join(" ")}" fill="${ink}"/>`;
    }
    case 3: // a crescent: a disc, a second of the ground's colour across it
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${ink}"/><circle cx="${cx + r * 0.45}" cy="${cy - r * 0.25}" r="${r * 0.82}" fill="${ground}"/>`;
    case 4: // a diamond
      return `<polygon points="${cx},${cy - r} ${cx + r * 0.8},${cy} ${cx},${cy + r} ${cx - r * 0.8},${cy}" fill="${ink}"/>`;
    default: // a triangle
      return `<polygon points="${cx},${cy - r} ${cx + r},${cy + r * 0.8} ${cx - r},${cy + r * 0.8}" fill="${ink}"/>`;
  }
};

/** The six ways a logo is set, each a whole 64-square image. */
const STYLES: readonly ((name: string, ground: string, ink: string, seed: number) => string)[] = [
  // A SEAL: a ring inside a disc, the letters set in a serif.
  (name, ground, ink) =>
    `<circle cx="32" cy="32" r="32" fill="${ground}"/><circle cx="32" cy="32" r="26" fill="none" stroke="${ink}" stroke-width="1.5"/>` +
    `<text x="32" y="39" text-anchor="middle" font-family="${SERIF}" font-size="20" font-weight="700" fill="${ink}" letter-spacing="1">${escape(initialsOf(name))}</text>`,
  // A MONOGRAM: one bold letter filling a rounded square.
  (name, ground, ink) =>
    `<rect width="64" height="64" rx="14" fill="${ground}"/>` +
    `<text x="32" y="46" text-anchor="middle" font-family="${SANS}" font-size="40" font-weight="800" fill="${ink}">${escape(initialsOf(name)[0] ?? "")}</text>`,
  // A GLYPH: the label's mark alone on its disc.
  (_name, ground, ink, seed) => `<circle cx="32" cy="32" r="32" fill="${ground}"/>${glyph(seed >>> 3, ink, ground, 32, 32, 15)}`,
  // A WORDMARK: the first word set small, a glyph over it.
  (name, ground, ink, seed) => {
    const word = escape((name.split(/\s+/)[0] ?? name).toUpperCase().slice(0, 7));
    return (
      `<rect width="64" height="64" rx="10" fill="${ground}"/>${glyph(seed >>> 5, ink, ground, 32, 24, 9)}` +
      `<text x="32" y="50" text-anchor="middle" font-family="${SANS}" font-size="${word.length > 5 ? 9 : 11}" font-weight="700" fill="${ink}" letter-spacing="1.5">${word}</text>`
    );
  },
  // A SPLIT BADGE: a disc halved on the diagonal, the letters across it.
  (name, ground, ink) =>
    `<circle cx="32" cy="32" r="32" fill="${ground}"/><path d="M 9.4 54.6 A 32 32 0 0 0 54.6 9.4 Z" fill="${ink}" opacity="0.18"/>` +
    `<text x="32" y="40" text-anchor="middle" font-family="${SANS}" font-size="22" font-weight="800" fill="${ink}" font-style="italic">${escape(initialsOf(name))}</text>`,
  // A STAMP: letters stacked over a rule, in a square frame.
  (name, ground, ink) => {
    const letters = escape(initialsOf(name));
    return (
      `<rect width="64" height="64" rx="6" fill="${ground}"/><rect x="6" y="6" width="52" height="52" rx="3" fill="none" stroke="${ink}" stroke-width="2"/>` +
      `<text x="32" y="36" text-anchor="middle" font-family="${SERIF}" font-size="18" font-weight="700" fill="${ink}" letter-spacing="2">${letters}</text>` +
      `<rect x="20" y="42" width="24" height="2" fill="${ink}"/>`
    );
  },
];

const made = new Map<string, string>();

/** A tenant's invented logo, as an image address — the same name, the same logo, every time. */
export function tenantArt(name: string): string {
  const known = made.get(name);
  if (known) return known;
  const seed = hashOf(name);
  const [ground, ink] = PALETTES[seed % PALETTES.length]!;
  const body = STYLES[(seed >>> 8) % STYLES.length]!(name, ground, ink, seed);
  const art = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">${body}</svg>`)}`;
  made.set(name, art);
  return art;
}
