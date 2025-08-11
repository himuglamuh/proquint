"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toProquint = toProquint;
// Standard proquint: 16 consonants + 4 vowels, C-V-C-V-C per 16 bits.
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
function toProquint(bytes, syllables, hyphen = false) {
    const maxSyll = Math.floor(bytes.length / 2);
    const count = syllables ? Math.min(syllables, maxSyll) : maxSyll;
    const parts = [];
    for (let i = 0; i < count; i++) {
        const hi = bytes[i * 2];
        const lo = bytes[i * 2 + 1];
        parts.push(syllableFrom16((hi << 8) | lo));
    }
    return hyphen ? parts.join("-") : parts.join("");
}
