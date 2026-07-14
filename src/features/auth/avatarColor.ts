// Deterministic avatar color from a name, using accent-family palette.
const PALETTE = [
  "#5A4BE3",
  "#4737C4",
  "#3B62D6",
  "#16A46E",
  "#E8A21E",
  "#E4553B",
  "#7A5AF8",
  "#2AA7A0",
];

export function avatarColorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return PALETTE[h % PALETTE.length];
}
