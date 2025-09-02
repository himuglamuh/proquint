> [!WARNING]
> This project is a work in progress. The API and features may change. Use at your own risk.

# Proquint Tool

Encode and decode [proquints](https://arxiv.org/html/0901.4016) from strings or cryptographic hashes.  
Supports `md5 | sha1 | sha256 | blake2s256 | none (raw)`, with control over syllable count, hyphenation, and padding.  

Built for memorable, human-friendly identifiers from binary data.

---

## ✨ Features

- **RFC Compliant**: Implements [`//TODO: add link to RFC`] specification exactly
- **Multiple Input Types**: Strings, byte arrays, or pipeline input
- **Hash → Proquint**: Generate identifiers from cryptographic hashes
- **Raw → Proquint**: Encode raw bytes directly with `--algo none`
- **Pipeline Support**: Read from stdin for integration with shell pipelines
- **Hyphenation**: Optional hyphens between syllables for readability
- **Padding**: Automatic RFC-compliant padding for odd-length inputs
- **Round-trip Safe**: Perfect encode/decode fidelity

---

## 📦 Install

```bash
git clone https://github.com/himuglamuh/proquint.git
cd proquint
npm install
npm run build
```

---

## 🚀 Usage

### Encode (String → Proquint)

```bash
# Raw string encoding
node dist/cli.js encode "Hello World"

# Hash-based encoding
node dist/cli.js encode "test" --algo md5 --hyphen

# With different hash algorithms
node dist/cli.js encode "data" --algo sha256
```

**Example Output:**
```json
{
  "input": "test",
  "algo": "none",
  "bytesHex": "74657374",
  "proquint": "lidoj-latuh"
}
```

### Pipeline Input

```bash
# Encode from stdin
echo -n "some text" | node dist/cli.js encode -a none --hyphen

# Decode from stdin  
echo -n "himuglamuh" | node dist/cli.js decode
```

### Byte Array Input

```bash
# JSON byte array input
node dist/cli.js encode '[70, 51, 114, 52]' --algo none --hyphen
```

**Output:**
```json
{
  "input": "[70, 51, 114, 52]",
  "algo": "none", 
  "bytesHex": "46337234",
  "proquint": "himug-lamuh"
}
```

### Decode (Proquint → Bytes)

```bash
node dist/cli.js decode "himug-lamuh"
```

**Output:**
```json
{
  "proquint": "himug-lamuh",
  "bytesHex": "46337234",
  "utf8Preview": "F3r4",
  "byteArray": [70, 51, 114, 52]
}
```

---

## 🧪 Testing

Run the comprehensive unit tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

The test suite includes:
- All RFC test vectors
- Round-trip encoding/decoding
- Error handling validation
- Edge cases and boundary conditions
- Hyphenation functionality

---

## 🔧 CLI Options

### `encode` command

| Option | Description | Default |
|--------|-------------|---------|
| `[input]` | Input string, byte array, or omit for stdin | Required |
| `-a, --algo <algo>` | Hash algorithm: `none`, `md5`, `sha1`, `sha256`, `blake2s256` | `md5` |
| `--hyphen` | Add hyphens between syllables | `false` |

### `decode` command

| Option | Description | Default |
|--------|-------------|---------|
| `[proquint]` | Proquint string or omit for stdin | Required |

---

## 🧠 How It Works

A **proquint** encodes binary data as alternating consonant-vowel letters in five-letter syllables following the CVCVC pattern.

**RFC Specification Features:**
- Fixed consonant table: `bdfghjklmnprstvz` (16 consonants)
- Fixed vowel table: `aiou` (4 vowels)  
- 16-bit words encoded as five letters: `C1V1C2V2C3`
- Automatic padding with trailing hyphen for odd-length inputs
- Case-insensitive decoding
- Interior hyphens ignored, trailing hyphen signals padding

**Example:**
- `0x1234` → `"damuh"`
- `0xF00D` → `"zabat"`  
- `[0x01, 0x02, 0x03]` → `"bahafbasab-"` (padded)

---

## 📋 RFC Compliance

This implementation strictly follows **draft-rayner-proquint-07**:

✅ Exact consonant/vowel tables  
✅ Proper bit layout (15-12, 11-10, 9-6, 5-4, 3-0)  
✅ Network byte order processing  
✅ Padding with trailing hyphen signaling  
✅ Case-insensitive decoding  
✅ All error conditions handled  
✅ Complete test vector validation  

---

## 📜 License

MIT — free to use, modify, and share.
