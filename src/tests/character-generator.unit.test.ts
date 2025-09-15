import { describe, test, expect, mock } from 'bun:test';
import * as CG from '../lib/character-generator';

const mockDiceRoll = mock(() => ({ total: 2 }));
mock.module('rpg-dice-roller', () => ({
  DiceRoll: mockDiceRoll
}));

describe('character-generator', () => {
  test('createInitialAttributes returns zeroed attributes', () => {
    const attrs = CG.createInitialAttributes();
    expect(attrs).toHaveLength(CG.ATTRIBUTES.length);
    attrs.forEach(a => expect(a.value).toBe(0));
  });

  test('rollSingleAttribute returns mocked value', () => {
    expect(CG.rollSingleAttribute()).toBe(2);
  });

  test('generateAttributes returns correct structure', () => {
    const result = CG.generateAttributes();
    expect(result.attributes).toHaveLength(CG.ATTRIBUTES.length);
    result.attributes.forEach(a => expect(typeof a.value).toBe('number'));
    expect(typeof result.performanceEnd).toBe('function');
  });

  test('generateAttributes handles errors', () => {
    mockDiceRoll.mockImplementationOnce(() => { throw new Error('fail'); });
    expect(() => CG.generateAttributes()).toThrow('fail');
  });
});
