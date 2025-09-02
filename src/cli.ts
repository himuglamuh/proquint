#!/usr/bin/env node
import { Command } from "commander";
import { getBytes, type Algo } from "./hash";
import { toProquint, fromProquint, addHyphens } from "./proquint";
import * as process from "process";

const program = new Command();

function parseByteArray(input: string): Buffer {
  try {
    const parsed = JSON.parse(input);
    if (Array.isArray(parsed) && parsed.every(n => typeof n === 'number' && n >= 0 && n <= 255)) {
      return Buffer.from(parsed);
    }
  } catch (e) {}
  throw new Error("Invalid byte array format. Expected JSON array of numbers 0-255.");
}

async function readStdin(): Promise<string> {
  if (process.stdin.isTTY) {
    return "";
  }
  
  const chunks: Buffer[] = [];
  process.stdin.setEncoding('utf8');
  
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk, 'utf8'));
  }
  
  return Buffer.concat(chunks).toString('utf8');
}

program
  .name("proquint")
  .description("Encode/decode proquints")
  .version("1.1.0");

program.command("encode")
  .description("String/bytes → (optional hash) → proquint")
  .argument("[input]", "input string, byte array as JSON, or omit to read from stdin")
  .option("-a, --algo <algo>", "none | md5 | sha1 | sha256 | blake2s256", "none")
  .option("--hyphen", "add hyphens between syllables for readability", false)
  .action(async (input: string | undefined, opts: { algo: Algo; hyphen: boolean }) => {
    try {
      let inputData: string;
      if (input === undefined) {
        inputData = await readStdin();
        if (!inputData) {
          console.error("Error: No input provided. Provide input as argument or pipe to stdin.");
          process.exit(1);
        }
      } else {
        inputData = input;
      }

      let bytes: Buffer;
      
      if (inputData.trim().startsWith('[') && inputData.trim().endsWith(']')) {
        bytes = parseByteArray(inputData.trim());
        if (opts.algo !== "none") {
          bytes = getBytes(bytes.toString('binary'), opts.algo);
        }
      } else {
        bytes = getBytes(inputData, opts.algo);
      }

      let pq = toProquint(bytes);
      if (opts.hyphen) {
        pq = addHyphens(pq);
      }

      const meta: any = {
        input: inputData,
        algo: opts.algo,
        bytesHex: bytes.toString("hex"),
        proquint: pq
      };
      if (opts.algo !== "none") meta.note = "Decoding proquint returns hash bytes, not the original input.";
      console.log(JSON.stringify(meta, null, 2));
    } catch (err) {
      console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
      process.exit(1);
    }
  });

program.command("decode")
  .description("Proquint → bytes (and UTF-8 preview)")
  .argument("[proquint]", "proquint string (with or without hyphens), or omit to read from stdin")
  .action(async (pq: string | undefined) => {
    try {
      let proquintData: string;
      if (pq === undefined) {
        proquintData = await readStdin();
        if (!proquintData) {
          console.error("Error: No input provided. Provide proquint as argument or pipe to stdin.");
          process.exit(1);
        }
      } else {
        proquintData = pq;
      }

      const bytes = fromProquint(proquintData.trim());
      const hex = bytes.toString("hex");
      const utf8 = bytes.toString("utf8");
      console.log(JSON.stringify({
        proquint: proquintData.trim(),
        bytesHex: hex,
        utf8Preview: utf8,
        byteArray: Array.from(bytes)
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
