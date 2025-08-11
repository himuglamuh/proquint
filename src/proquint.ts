const CONSONANTS = "bdfghjklmnprstvz";
const VOWELS = "aiou";

function indexOf(ch: string, table: string): number {
  const pos = table.indexOf(ch);
  if (pos < 0) {
    throw new Error("invalid character");
  }
  return pos;
}

export function toProquint(bytes: Buffer): string {
  if (bytes.length === 0) {
    throw new Error("empty input not allowed");
  }

  let out = "";
  let i = 0;
  let pad = false;

  while (i < bytes.length) {
    const hi = bytes[i];
    i += 1;
    let lo: number;
    if (i < bytes.length) {
      lo = bytes[i];
      i += 1;
    } else {
      lo = 0x00;
      pad = true;
    }

    const w = (hi << 8) | lo;
    const c1 = CONSONANTS[(w >> 12) & 0xF];
    const v1 = VOWELS[(w >> 10) & 0x3];
    const c2 = CONSONANTS[(w >> 6) & 0xF];
    const v2 = VOWELS[(w >> 4) & 0x3];
    const c3 = CONSONANTS[w & 0xF];
    out += c1 + v1 + c2 + v2 + c3;
  }

  if (pad && out.length > 0) {
    out += '-';
  }

  return out;
}

export function fromProquint(pq: string): Buffer {
  pq = pq.toLowerCase();

  let pad = false;
  if (pq.length > 0 && pq[pq.length - 1] === '-') {
    pad = true;
    if (pq.length >= 2 && pq[pq.length - 2] === '-') {
      throw new Error("multiple trailing hyphens");
    }
    pq = pq.slice(0, -1);
  }

  if (pq.length > 0 && pq[0] === '-') {
    throw new Error("leading hyphen not allowed");
  }
  if (pq.includes("--")) {
    throw new Error("consecutive interior hyphens not allowed");
  }

  if (pq === "") {
    throw new Error("empty input not allowed");
  }

  let parts: string[] = [];
  if (pq.includes("-")) {
    parts = pq.split("-");
    if (parts.some(p => p === "")) {
      throw new Error("invalid empty syllable");
    }
  } else {
    if ((pq.length % 5) !== 0) {
      throw new Error("run-on form length must be a multiple of 5");
    }
    for (let i = 0; i < pq.length; i += 5) {
      parts.push(pq.slice(i, i + 5));
    }
  }

  const out = new Array<number>(2 * parts.length);
  let k = 0;
  for (const part of parts) {
    if (part.length !== 5) {
      throw new Error("syllable length must be 5");
    }

    const c1 = indexOf(part[0], CONSONANTS);
    const v1 = indexOf(part[1], VOWELS);
    const c2 = indexOf(part[2], CONSONANTS);
    const v2 = indexOf(part[3], VOWELS);
    const c3 = indexOf(part[4], CONSONANTS);
    const w = (c1 << 12) | (v1 << 10) | (c2 << 6) | (v2 << 4) | c3;
    out[k] = (w >> 8) & 0xFF;
    out[k + 1] = w & 0xFF;
    k += 2;
  }

  if (pad) {
    if (k === 0 || out[k - 1] !== 0x00) {
      throw new Error("trailing hyphen requires final 0x00 padding byte");
    }
    k -= 1;
  }

  return Buffer.from(out.slice(0, k));
}
