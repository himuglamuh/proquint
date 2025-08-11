#!/usr/bin/env node
import { Command } from "commander";
import { getBytes, type Algo } from "./hash";
import { toProquint, fromProquint } from "./proquint";

const program = new Command();

program
  .name("proquint")
  .description("Encode/decode proquints per RFC draft-rayner-proquint-07")
  .version("1.1.0");

program.command("encode")
  .description("String → (optional hash) → proquint")
  .argument("<seed>", "input string")
  .option("-a, --algo <algo>", "none | md5 | sha1 | sha256 | blake2s256", "md5")
  .action((seed: string, opts: { algo: Algo }) => {
    const algo = opts.algo as Algo;
    const bytes = getBytes(seed, algo);
    const pq = toProquint(bytes);
    const meta: any = {
      seed, algo,
      bytesHex: bytes.toString("hex"),
      proquint: pq
    };
    if (algo !== "none") meta.note = "Decoding proquint returns hash bytes, not the original seed.";
    console.log(JSON.stringify(meta, null, 2));
  });

program.command("decode")
  .description("Proquint → bytes (and UTF-8 preview)")
  .argument("<proquint>", "proquint string (with or without hyphens)")
  .action((pq: string) => {
    try {
      const bytes = fromProquint(pq.trim());
      const hex = bytes.toString("hex");
      const utf8 = bytes.toString("utf8");
      console.log(JSON.stringify({
        proquint: pq,
        bytesHex: hex,
        utf8Preview: utf8
      }, null, 2));
    } catch (err) {
      console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

program.parseAsync().catch(err => {
  console.error(err);
  process.exit(1);
});
