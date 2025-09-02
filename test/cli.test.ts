import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);
const CLI_PATH = path.join(__dirname, '../dist/cli.js');

describe('CLI Integration Tests', () => {
  beforeAll(async () => {
    // Build the project before running tests
    await execAsync('npm run build');
  }, 30000);

  describe('encode command', () => {
    it('should encode string with default algorithm (none)', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} encode "test"`);
      const result = JSON.parse(stdout);
      
      expect(result.input).toBe('test');
      expect(result.algo).toBe('none');
      expect(result.bytesHex).toBe('74657374');
      expect(result.proquint).toBe('lidojlatuh');
    });

    it('should encode with md5 algorithm', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} encode "test" --algo md5`);
      const result = JSON.parse(stdout);
      
      expect(result.input).toBe('test');
      expect(result.algo).toBe('md5');
      expect(result.bytesHex).toBe('098f6bcd4621d373cade4e832627b4f6');
      expect(result.note).toBe('Decoding proquint returns hash bytes, not the original input.');
    });

    it('should encode with hyphen option', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} encode "test" --hyphen`);
      const result = JSON.parse(stdout);
      
      expect(result.proquint).toBe('lidoj-latuh');
    });

    it('should encode byte array input', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} encode '[116, 101, 115, 116]'`);
      const result = JSON.parse(stdout);
      
      expect(result.input).toBe('[116, 101, 115, 116]');
      expect(result.bytesHex).toBe('74657374');
      expect(result.proquint).toBe('lidojlatuh');
    });

    it('should handle stdin input', async () => {
      const { stdout } = await execAsync(`echo -n "test" | node ${CLI_PATH} encode`);
      const result = JSON.parse(stdout);
      
      expect(result.input).toBe('test');
      expect(result.algo).toBe('none');
      expect(result.bytesHex).toBe('74657374');
      expect(result.proquint).toBe('lidojlatuh');
    });

    it('should error with empty string input', async () => {
      try {
        await execAsync(`node ${CLI_PATH} encode ""`);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.stderr).toContain('empty input not allowed');
      }
    });

    it('should error with invalid byte array', async () => {
      try {
        await execAsync(`node ${CLI_PATH} encode '[256, 300]'`);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.stderr).toContain('Invalid byte array format');
      }
    });
  });

  describe('decode command', () => {
    it('should decode proquint to bytes', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} decode "lidoj-latuh"`);
      const result = JSON.parse(stdout);
      
      expect(result.proquint).toBe('lidoj-latuh');
      expect(result.bytesHex).toBe('74657374');
      expect(result.utf8Preview).toBe('test');
      expect(result.byteArray).toEqual([116, 101, 115, 116]);
    });

    it('should decode proquint without hyphens', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} decode "lidojlatuh"`);
      const result = JSON.parse(stdout);
      
      expect(result.proquint).toBe('lidojlatuh');
      expect(result.bytesHex).toBe('74657374');
      expect(result.utf8Preview).toBe('test');
    });

    it('should handle RFC test vectors', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} decode "babab"`);
      const result = JSON.parse(stdout);
      
      expect(result.bytesHex).toBe('0000');
      expect(result.byteArray).toEqual([0, 0]);
    });

    it('should handle padding', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} decode "bahab-"`);
      const result = JSON.parse(stdout);
      
      expect(result.bytesHex).toBe('01');
      expect(result.byteArray).toEqual([1]);
    });

    it('should handle stdin input', async () => {
      const { stdout } = await execAsync(`echo -n "babab" | node ${CLI_PATH} decode`);
      const result = JSON.parse(stdout);
      
      expect(result.proquint).toBe('babab');
      expect(result.bytesHex).toBe('0000');
    });

    it('should error with invalid proquint', async () => {
      try {
        await execAsync(`node ${CLI_PATH} decode "invalid"`);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.stderr).toContain('run-on form length must be a multiple of 5');
      }
    });

    it('should error with empty string input', async () => {
      try {
        await execAsync(`node ${CLI_PATH} decode ""`);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.stderr).toContain('empty input not allowed');
      }
    });
  });

  describe('help and version', () => {
    it('should show help', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} --help`);
      expect(stdout).toContain('Encode/decode proquints');
      expect(stdout).toContain('encode');
      expect(stdout).toContain('decode');
    });

    it('should show version', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} --version`);
      expect(stdout.trim()).toBe('1.1.0');
    });

    it('should show encode help', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} encode --help`);
      expect(stdout).toContain('String/bytes → (optional hash) → proquint');
      expect(stdout).toContain('--algo');
      expect(stdout).toContain('--hyphen');
    });

    it('should show decode help', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} decode --help`);
      expect(stdout).toContain('Proquint → bytes');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle case insensitive proquint', async () => {
      const { stdout } = await execAsync(`node ${CLI_PATH} decode "BABAB"`);
      const result = JSON.parse(stdout);
      
      expect(result.bytesHex).toBe('0000');
    });

    it('should handle different hash algorithms', async () => {
      const algorithms = ['sha1', 'sha256', 'blake2s256'];
      
      for (const algo of algorithms) {
        const { stdout } = await execAsync(`node ${CLI_PATH} encode "test" --algo ${algo}`);
        const result = JSON.parse(stdout);
        
        expect(result.algo).toBe(algo);
        expect(result.note).toBe('Decoding proquint returns hash bytes, not the original input.');
      }
    });

    it('should handle empty string encoding error', async () => {
      try {
        await execAsync(`node ${CLI_PATH} encode ""`);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.stderr).toContain('empty input not allowed');
      }
    });

    it('should handle malformed JSON byte array', async () => {
      try {
        await execAsync(`node ${CLI_PATH} encode '[1, 2, "invalid"]'`);
        fail('Should have thrown an error');
      } catch (error: any) {
        expect(error.stderr).toContain('Invalid byte array format');
      }
    });
  });
});