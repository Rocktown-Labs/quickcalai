import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn utility', () => {
  it('should merge class names correctly', () => {
    const result = cn('c1', 'c2');
    expect(result).toBe('c1 c2');
  });

  it('should handle conditional classes', () => {
    const result = cn('c1', true && 'c2', false && 'c3');
    expect(result).toBe('c1 c2');
  });

  it('should handle arrays and objects', () => {
    const result = cn('c1', ['c2', 'c3'], { c4: true, c5: false });
    expect(result).toBe('c1 c2 c3 c4');
  });

  it('should merge tailwind classes correctly', () => {
    // tailwind-merge should handle this
    const result = cn('px-2 py-1', 'p-4');
    expect(result).toBe('p-4');
  });
});
