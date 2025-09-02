import { toProquint, fromProquint, addHyphens } from './proquint';

describe('proquint', () => {
  describe('toProquint', () => {
    it('should encode RFC test vectors correctly', () => {
      expect(toProquint(Buffer.from([0x00, 0x00]))).toBe('babab');
      expect(toProquint(Buffer.from([0xFF, 0xFF]))).toBe('zuzuz');
      expect(toProquint(Buffer.from([0x12, 0x34]))).toBe('damuh');
      expect(toProquint(Buffer.from([0xF0, 0x0D]))).toBe('zabat');
      expect(toProquint(Buffer.from([0xBE, 0xEF]))).toBe('ruroz');
    });

    it('should encode multi-word sequences', () => {
      expect(toProquint(Buffer.from([0x12, 0x34, 0xF0, 0x0D]))).toBe('damuhzabat');
    });

    it('should handle odd-length input with padding', () => {
      expect(toProquint(Buffer.from([0x01]))).toBe('bahab-');
      expect(toProquint(Buffer.from([0x01, 0x02, 0x03]))).toBe('bahafbasab-');
      expect(toProquint(Buffer.from([0x46, 0x33, 0x72, 0x34, 0x31, 0x4F, 0x75, 0x74, 0x4C, 0x34, 0x77]))).toBe('himuglamuhgajazlijuhhubuhlisab-');
    });

    it('should handle even-length input without padding', () => {
      expect(toProquint(Buffer.from([0x01, 0x02]))).toBe('bahaf');
      expect(toProquint(Buffer.from([0x01, 0x02, 0x03, 0x00]))).toBe('bahafbasab');
    });

    it('should throw error for empty input', () => {
      expect(() => toProquint(Buffer.from([]))).toThrow('empty input not allowed');
    });

    it('should handle single byte correctly', () => {
      expect(toProquint(Buffer.from([0xFF]))).toBe('zusab-');
      expect(toProquint(Buffer.from([0x00]))).toBe('babab-');
    });
  });

  describe('fromProquint', () => {
    it('should decode RFC test vectors correctly', () => {
      expect(fromProquint('babab')).toEqual(Buffer.from([0x00, 0x00]));
      expect(fromProquint('zuzuz')).toEqual(Buffer.from([0xFF, 0xFF]));
      expect(fromProquint('damuh')).toEqual(Buffer.from([0x12, 0x34]));
      expect(fromProquint('zabat')).toEqual(Buffer.from([0xF0, 0x0D]));
      expect(fromProquint('ruroz')).toEqual(Buffer.from([0xBE, 0xEF]));
    });

    it('should decode multi-word sequences', () => {
      expect(fromProquint('damuhzabat')).toEqual(Buffer.from([0x12, 0x34, 0xF0, 0x0D]));
    });

    it('should handle hyphenated input', () => {
      expect(fromProquint('damuh-zabat')).toEqual(Buffer.from([0x12, 0x34, 0xF0, 0x0D]));
      expect(fromProquint('bahaf-basab')).toEqual(Buffer.from([0x01, 0x02, 0x03, 0x00]));
    });

    it('should handle case insensitive input', () => {
      expect(fromProquint('BABAB')).toEqual(Buffer.from([0x00, 0x00]));
      expect(fromProquint('DaMuH')).toEqual(Buffer.from([0x12, 0x34]));
      expect(fromProquint('ZaBaT')).toEqual(Buffer.from([0xF0, 0x0D]));
    });

    it('should handle padding correctly', () => {
      expect(fromProquint('bahab-')).toEqual(Buffer.from([0x01]));
      expect(fromProquint('bahafbasab-')).toEqual(Buffer.from([0x01, 0x02, 0x03]));
    });

    it('should handle even-length without padding marker', () => {
      expect(fromProquint('bahafbasab')).toEqual(Buffer.from([0x01, 0x02, 0x03, 0x00]));
    });

    it('should throw error for invalid inputs', () => {
      expect(() => fromProquint('')).toThrow('empty input not allowed');
      expect(() => fromProquint('abc')).toThrow('run-on form length must be a multiple of 5');
      expect(() => fromProquint('abcde')).toThrow('invalid character');
      expect(() => fromProquint('--')).toThrow('multiple trailing hyphens');
      expect(() => fromProquint('-babab')).toThrow('leading hyphen not allowed');
      expect(() => fromProquint('ba--hab')).toThrow('consecutive interior hyphens not allowed');
      expect(() => fromProquint('bahafbasad-')).toThrow('trailing hyphen requires final 0x00 padding byte');
    });

    it('should handle invalid trailing hyphen case', () => {
      expect(() => fromProquint('babab--damuh')).toThrow('consecutive interior hyphens not allowed');
      expect(() => fromProquint('bahad-')).toThrow('trailing hyphen requires final 0x00 padding byte');
    });
  });

  describe('addHyphens', () => {
    it('should add hyphens between syllables', () => {
      expect(addHyphens('babab')).toBe('babab');
      expect(addHyphens('damuhzabat')).toBe('damuh-zabat');
      expect(addHyphens('himuglamuhgajaz')).toBe('himug-lamuh-gajaz');
    });

    it('should preserve trailing hyphen for padding', () => {
      expect(addHyphens('bahab-')).toBe('bahab-');
      expect(addHyphens('damuhzabat-')).toBe('damuh-zabat-');
      expect(addHyphens('himuglamuhgajazlijuhhubuhlisab-')).toBe('himug-lamuh-gajaz-lijuh-hubuh-lisab-');
    });

    it('should handle run-on syllables correctly', () => {
      expect(addHyphens('damuhzabat')).toBe('damuh-zabat');
      expect(addHyphens('bahafbasab')).toBe('bahaf-basab');
    });

    it('should handle empty and single syllable inputs', () => {
      expect(addHyphens('')).toBe('');
      expect(addHyphens('babab')).toBe('babab');
    });
  });

  describe('round-trip encoding', () => {
    const testCases = [
      [0x00],
      [0xFF],
      [0x00, 0x00],
      [0xFF, 0xFF],
      [0x01, 0x02],
      [0x01, 0x02, 0x03],
      [0x01, 0x02, 0x03, 0x04],
      [0x12, 0x34, 0xF0, 0x0D],
      [0xBE, 0xEF, 0xCA, 0xFE, 0xBA, 0xBE],
      [0x46, 0x33, 0x72, 0x34, 0x31, 0x4F, 0x75, 0x74, 0x4C, 0x34, 0x77]
    ];

    testCases.forEach((bytes, index) => {
      it(`should round-trip correctly for test case ${index + 1}`, () => {
        const original = Buffer.from(bytes);
        const encoded = toProquint(original);
        const decoded = fromProquint(encoded);
        expect(decoded).toEqual(original);
      });
    });

    it('should round-trip with hyphens', () => {
      const original = Buffer.from([0x12, 0x34, 0xF0, 0x0D]);
      const encoded = addHyphens(toProquint(original));
      const decoded = fromProquint(encoded);
      expect(decoded).toEqual(original);
    });
  });

  describe('edge cases', () => {
    it('should handle maximum values', () => {
      const maxBytes = Buffer.from([0xFF, 0xFF, 0xFF, 0xFF]);
      const encoded = toProquint(maxBytes);
      const decoded = fromProquint(encoded);
      expect(decoded).toEqual(maxBytes);
    });

    it('should handle minimum values', () => {
      const minBytes = Buffer.from([0x00, 0x00, 0x00, 0x00]);
      const encoded = toProquint(minBytes);
      const decoded = fromProquint(encoded);
      expect(decoded).toEqual(minBytes);
    });

    it('should handle random byte sequences', () => {
      const randomBytes = Buffer.from([0xAB, 0xCD, 0xEF, 0x12, 0x34, 0x56, 0x78]);
      const encoded = toProquint(randomBytes);
      const decoded = fromProquint(encoded);
      expect(decoded).toEqual(randomBytes);
    });
  });
});