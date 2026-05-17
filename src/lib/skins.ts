export type SkinId = "neon" | "emberwood" | "monoair" | "ivory";

export interface Skin {
  id: SkinId;
  name: string;
  tagline: string;
  xpRequired: number;
  vibe: string;
}

export const SKINS: Skin[] = [
  { id: "neon",      name: "Neon Pulse",    tagline: "Cybersport luminous",   xpRequired: 0,    vibe: "Sci-fi grid · electric pulse on capture" },
  { id: "emberwood", name: "Emberwood",     tagline: "Walnut & amber glow",   xpRequired: 500,  vibe: "Premium minimalism · antique chess clocks" },
  { id: "monoair",   name: "Mono Air",      tagline: "Apple-minimal monochrome", xpRequired: 1200, vibe: "Whitespace · flat pieces · mobile-first" },
  { id: "ivory",     name: "Ivory Classic", tagline: "Tournament heritage",   xpRequired: 2500, vibe: "Engraved · old-school · ivory clack" },
];

export function applySkin(id: SkinId) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-skin", id);
}