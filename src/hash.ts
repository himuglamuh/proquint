import { createHash } from "crypto";

export type Algo = "none" | "md5" | "sha1" | "sha256" | "blake2s256";

export function digest(input: string, algo: Algo): Buffer {
  if (algo === "none") {
    return Buffer.from(input, "utf8");
  }
  return createHash(algo).update(input).digest();
}
