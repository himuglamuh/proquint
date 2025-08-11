#!/usr/bin/env node
import { Command } from "commander";
import { digest, type Algo } from "./hash";
import { toProquint } from "./proquint";

const program = new Command();

program
  .name("proquint")
  .description("Hash → proquint encoder (standard C-V-C-V-C syllables)")
  .version("1.0.0");

program
  .argument("<seed>", "input string to hash")
  .option("-a, --algo <algo>", "hash algorithm (none|md5|sha1|sha256|blake2s256)", "md5")
  .option("-s, --syllables <n>", "number of syllables (default: all)", "")
  .option("--hyphen", "join syllables with hyphens", false)
  .action((seed: string, opts: { algo: Algo; syllables?: string; hyphen?: boolean }) => {
    const algo = opts.algo as Algo;
    const buf = digest(seed, algo);
    const n = opts.syllables ? Math.max(1, Math.floor(Number(opts.syllables))) : undefined;
    const pq = toProquint(buf, n, !!opts.hyphen);
    const syllablesUsed = n ?? Math.floor(buf.length / 2);
    console.log(JSON.stringify({
      seed,
      algo,
      digestHex: buf.toString("hex"),
      syllables: syllablesUsed,
      proquint: pq
    }, null, 2));
  });

program.parseAsync().catch(err => {
  console.error(err);
  process.exit(1);
});
