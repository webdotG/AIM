import { createApiPreset } from '../presets/apiPreset';
import { createUserInputPreset } from '../presets/userInputPreset';
import { createSearchPreset } from '../presets/searchPreset';
import { SQLInjectionSanitizer } from '../sanitizers/search/SQLInjectionSanitizer';
import { XSSSanitizer } from '../sanitizers/reflected/XSSSanitizer';
import { CommandInjectionSanitizer } from '../sanitizers/reflected/CommandInjectionSanitizer';
import { PathTraversalSanitizer } from '../sanitizers/reflected/PathTraversalSanitizer';
import { TrimSanitizer } from '../sanitizers/shared/TrimSanitizer';
import { LengthSanitizer } from '../sanitizers/shared/LengthSanitizer';

describe('Security Sanitizers', () => {
  describe('SQLInjectionSanitizer', () => {
    it('should detect and sanitize SQL injection attempts', () => {
      const sanitizer = new SQLInjectionSanitizer();
      
      expect(sanitizer.shouldSanitize("' OR 1=1--")).toBe(true);
      expect(sanitizer.shouldSanitize("'; DROP TABLE users--")).toBe(true);
      expect(sanitizer.shouldSanitize("1 UNION SELECT * FROM users")).toBe(true);
      expect(sanitizer.shouldSanitize("Hello World")).toBe(false);
    });

    it('should sanitize SQL injection patterns', () => {
      const sanitizer = new SQLInjectionSanitizer();
      
      const result1 = sanitizer.sanitize("' OR 1=1--");
      expect(result1 as string).not.toContain("DROP");
      expect(result1 as string).not.toContain("OR");

      const result2 = sanitizer.sanitize("'; SELECT * FROM users--");
      expect(result2 as string).not.toContain("SELECT");
    });
  });

  describe('XSSSanitizer', () => {
    it('should detect and sanitize XSS attempts', () => {
      const sanitizer = new XSSSanitizer();
      
      expect(sanitizer.shouldSanitize('<script>alert(1)</script>')).toBe(true);
      expect(sanitizer.shouldSanitize('<img src=x onerror=alert(1)>')).toBe(true);
      expect(sanitizer.shouldSanitize('javascript:alert(1)')).toBe(true);
      expect(sanitizer.shouldSanitize('Hello World')).toBe(false);
    });

    it('should sanitize XSS patterns', () => {
      const sanitizer = new XSSSanitizer();
      
      const result1 = sanitizer.sanitize('<script>alert(1)</script>');
      expect(result1 as string).not.toContain('<script');

const result2 = sanitizer.sanitize('Hello <img src=x onerror=alert(1)>');
      // after stripping onX= and HTML escaping, should not have onerror or raw script tags
      expect(result2 as string).not.toContain('onerror');
      expect(result2 as string).not.toContain('<script');
    });
  });

  describe('CommandInjectionSanitizer', () => {
    it('should detect and sanitize command injection attempts', () => {
      const sanitizer = new CommandInjectionSanitizer();
      
      expect(sanitizer.shouldSanitize('test; cat /etc/passwd')).toBe(true);
      expect(sanitizer.shouldSanitize('whoami')).toBe(true);
      expect(sanitizer.shouldSanitize('$(ls -la)')).toBe(true);
      expect(sanitizer.shouldSanitize('Hello World')).toBe(false);
    });

    it('should sanitize command injection patterns', () => {
      const sanitizer = new CommandInjectionSanitizer();
      
      const result1 = sanitizer.sanitize('test; cat /etc/passwd');
      // Sanitizer removes shell metacharacters like ; and dangerous paths
      expect(result1 as string).not.toContain(';');
      expect((result1 as string).length).toBeLessThan('test; cat /etc/passwd'.length);
    });
  });

  describe('PathTraversalSanitizer', () => {
    it('should detect and sanitize path traversal attempts', () => {
      const sanitizer = new PathTraversalSanitizer();
      
      expect(sanitizer.shouldSanitize('../../etc/passwd')).toBe(true);
      expect(sanitizer.shouldSanitize('..%2f..%2fetc/passwd')).toBe(true);
      expect(sanitizer.shouldSanitize('file.txt')).toBe(false);
    });

    it('should sanitize path traversal patterns', () => {
      const sanitizer = new PathTraversalSanitizer();
      
      const result1 = sanitizer.sanitize('../../etc/passwd');
      expect(result1 as string).not.toContain('..');
    });
  });

  describe('TrimSanitizer', () => {
    it('should trim whitespace from strings', () => {
      const sanitizer = new TrimSanitizer();
      
      expect(sanitizer.sanitize('  Hello World  ')).toBe('Hello World');
      expect(sanitizer.sanitize('Hello World')).toBe('Hello World');
      expect(sanitizer.shouldSanitize('  Hello  ')).toBe(true);
      expect(sanitizer.shouldSanitize('Hello')).toBe(false);
    });
  });

  describe('LengthSanitizer', () => {
    it('should enforce maximum length', () => {
      const sanitizer = new LengthSanitizer({ maxLength: 10 });
      
      const result = sanitizer.sanitize('Hello World This is a long string');
      expect((result as string).length).toBeLessThanOrEqual(10);
    });

    it('should handle minimum length in strict mode', () => {
      const sanitizer = new LengthSanitizer({ minLength: 5, strict: true });
      
      expect(() => sanitizer.sanitize('Hi')).toThrow();
    });
  });

  describe('Presets', () => {
    it('userInputPreset should sanitize user input', () => {
      const pipeline = createUserInputPreset({ debug: false });
      
      const maliciousInput = {
        name: '<script>alert(1)</script>',
        email: "' OR 1=1--",
        search: '../../etc/passwd',
      };

      const result = pipeline.executeDeep(maliciousInput);
      
      expect((result as any).name).not.toContain('<script');
      expect((result as any).email).not.toContain('OR');
      expect((result as any).search).not.toContain('..');
    });

    it('apiPreset should sanitize API data', async () => {
      const pipeline = createApiPreset({ debug: false });
      
      const maliciousInput = {
        body: { content: '<script>alert(1)</script>' },
        query: { search: "' DROP TABLE users--" },
      };

      const result = await pipeline.executeDeep(maliciousInput);
      
      expect((result as any).body.content).not.toContain('<script');
      expect((result as any).query.search).not.toContain('DROP');
    });

    it('searchPreset should sanitize search queries', () => {
      const pipeline = createSearchPreset({ debug: false });
      
      const maliciousQuery = "'; DROP TABLE users--";
      const result = pipeline.execute(maliciousQuery);

      expect(result as string).not.toContain('DROP');
    });
  });
});