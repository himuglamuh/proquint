"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toProquint = toProquint;
exports.fromProquint = fromProquint;
// Standard proquint tables: 16 consonants, 4 vowels
const CONSONANTS = "bdfghjklmnprstvz";
const VOWELS = "aiou";
function syllableFrom16(n) {
    const c1 = CONSONANTS[(n >>> 12) & 0x0f];
    const v1 = VOWELS[(n >>> 10) & 0x03];
    const c2 = CONSONANTS[(n >>> 6) & 0x0f];
    const v2 = VOWELS[(n >>> 4) & 0x03];
    const c3 = CONSONANTS[n & 0x0f];
    return `${c1}${v1}${c2}${v2}${c3}`;
}
/** Encode bytes → proquint. If bytes length is odd and pad=true, pads with 0x00. */
function toProquint(bytes, opts) {
    const hyphen = !!opts?.hyphen;
    const pad = opts?.pad !== false; // default true
    let buf = bytes;
    if (buf.length % 2 === 1 && pad)
        buf = Buffer.concat([buf, Buffer.from([0])]);
    const maxSyll = Math.floor(buf.length / 2);
    const count = opts?.syllables ? Math.min(opts.syllables, maxSyll) : maxSyll;
    const parts = [];
    for (let i = 0; i < count; i++) {
        const hi = buf[i * 2];
        const lo = buf[i * 2 + 1];
        parts.push(syllableFrom16((hi << 8) | lo));
    }
    return hyphen ? parts.join("-") : parts.join("");
}
/** Decode proquint (hyphenated or not) → bytes. Throws on invalid characters/length. */
function fromProquint(pq) {
    const clean = pq.includes("-")
        ? pq.split("-").join("")
        : pq;
    if (clean.length % 5 !== 0) {
        throw new Error("Invalid proquint length: must be multiple of 5 characters (per syllable).");
    }
    const bytes = [];
    for (let i = 0; i < clean.length; i += 5) {
        const q = clean.slice(i, i + 5);
        const c1 = CONSONANTS.indexOf(q[0]);
        const v1 = VOWELS.indexOf(q[1]);
        const c2 = CONSONANTS.indexOf(q[2]);
        const v2 = VOWELS.indexOf(q[3]);
        const c3 = CONSONANTS.indexOf(q[4]);
        if (c1 < 0 || v1 < 0 || c2 < 0 || v2 < 0 || c3 < 0) {
            throw new Error(`Invalid proquint syllable: "${q}"`);
        }
        const val = (c1 << 12) | (v1 << 10) | (c2 << 6) | (v2 << 4) | c3;
        bytes.push((val >> 8) & 0xff, val & 0xff);
    }
    return Buffer.from(bytes);
}
