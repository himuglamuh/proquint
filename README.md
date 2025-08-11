# Proquint Tool

Encode and decode [proquints](https://arxiv.org/html/0901.4016) from strings or cryptographic hashes.  
Supports `md5 | sha1 | sha256 | blake2s256 | none` (raw), with control over syllable count, hyphenation, and padding.  

Built for when you want memorable, pronounceable identifiers from otherwise opaque bytes.

---

## ✨ Features

- **Hash → Proquint**: Generate pronounceable, semi-random identifiers from cryptographic hashes.
- **Raw → Proquint**: Use `--algo none` to encode raw strings directly.
- **Decode**: Turn proquints back into their byte representation (and UTF-8 preview if raw).
- **Readable IDs**: Control syllables and hyphenation for human-friendly output.
- **Round-trip Safe**: Zero-pad odd byte counts in raw mode by default for full decode support.

---

## 📦 Install

```bash
git clone https://github.com/himuglamuh/proquint.git
cd proquint
npm install
npm run build
````

---

## 🚀 Usage

### Encode (Hash → Proquint)

```bash
node dist/cli.js encode "F3r41OutL4w" -a md5 -s 2
```

**Output:**

```json
{
  "seed": "F3r41OutL4w",
  "algo": "md5",
  "bytesHex": "bb2b9f316709768d7c138b83800beb16",
  "syllables": 2,
  "proquint": "rosornusud",
  "note": "Decoding proquint returns hash bytes, not the original seed."
}
```

---

### Encode Raw (No Hash)

```bash
node dist/cli.js encode "F3r41OutL4w" -a none -s 2 --hyphen
```

**Output:**

```json
{
  "seed": "F3r41OutL4w",
  "algo": "none",
  "bytesHex": "46337234314f75744c3477",
  "syllables": 2,
  "proquint": "himug-lamuh"
}
```

Use `--no-pad` to skip zero-padding on odd byte counts.

---

### Decode (Proquint → Bytes)

```bash
node dist/cli.js decode "himug-lamuh"
```

**Output:**

```json
{
  "proquint": "himug-lamuh",
  "bytesHex": "46337234",
  "utf8Preview": "F3r4"
}
```

> ℹ️ If you encoded with a hash algorithm, decoding returns hash bytes, not the original seed.

```bash
node dist/cli.js decode "rosornusud"
```

**Output:**

```json
{
  "proquint": "rosornusud",
  "bytesHex": "bb2b9f31",
  "utf8Preview": "�+�1"
}
```

---

## 🧠 How It Works

A **proquint** encodes 16-bit chunks into five-letter syllables:
`consonant-vowel-consonant-vowel-consonant` using fixed tables of 16 consonants and 4 vowels.

For example:

* `0xC0DE` → `"lugov"`
* `0xBEEF` → `"rinuv"`

This tool:

1. **Gets bytes** from either a hash (`md5`, `sha1`, `sha256`, `blake2s256`) or raw string.
2. **Pads** bytes if necessary to keep 16-bit boundaries (optional).
3. **Encodes** each 16-bit chunk into a syllable.
4. **Joins** syllables with or without hyphens.

Decoding reverses this mapping.

---

## 📜 License

MIT — free to use, modify, and share.
