#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const hash_1 = require("./hash");
const proquint_1 = require("./proquint");
const program = new commander_1.Command();
program
    .name("proquint")
    .description("Encode/decode proquints. Hash first (md5/sha1/sha256/blake2s256) or use --algo none for raw bytes.")
    .version("1.1.0");
program.command("encode")
    .description("String → (optional hash) → proquint")
    .argument("<seed>", "input string")
    .option("-a, --algo <algo>", "none | md5 | sha1 | sha256 | blake2s256", "md5")
    .option("-s, --syllables <n>", "number of syllables (default: all)", "")
    .option("--hyphen", "join syllables with hyphens", false)
    .option("--no-pad", "don't zero-pad odd byte counts (raw only)")
    .action((seed, opts) => {
    const algo = opts.algo;
    const bytes = (0, hash_1.getBytes)(seed, algo);
    const n = opts.syllables ? Math.max(1, Math.floor(Number(opts.syllables))) : undefined;
    const pq = (0, proquint_1.toProquint)(bytes, { syllables: n, hyphen: !!opts.hyphen, pad: opts.pad });
    const meta = {
        seed, algo,
        bytesHex: bytes.toString("hex"),
        syllables: n ?? Math.floor((opts.pad === false ? bytes.length - (bytes.length % 2) : (bytes.length + (bytes.length % 2 === 1 ? 1 : 0))) / 2),
        proquint: pq
    };
    if (algo !== "none")
        meta.note = "Decoding proquint returns hash bytes, not the original seed.";
    console.log(JSON.stringify(meta, null, 2));
});
program.command("decode")
    .description("Proquint → bytes (and UTF-8 preview)")
    .argument("<proquint>", "proquint string (with or without hyphens)")
    .action((pq) => {
    const bytes = (0, proquint_1.fromProquint)(pq.trim());
    const hex = bytes.toString("hex");
    // UTF-8 preview: show replacement characters if invalid
    const utf8 = bytes.toString("utf8");
    console.log(JSON.stringify({
        proquint: pq,
        bytesHex: hex,
        utf8Preview: utf8
    }, null, 2));
});
program.parseAsync().catch(err => {
    console.error(err);
    process.exit(1);
});
