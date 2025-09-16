import { describe, test, expect } from 'bun:test';
import * as types from '../lib/types';

describe('types', () => {
  test('Attribute type structure', () => {
    const attr: types.Attribute = { name: 'FOR', value: 1 };
    expect(attr.name).toBe('FOR');
    expect(typeof attr.value).toBe('number');
  });

  test('CharacterRollerState type structure', () => {
    const state: types.CharacterRollerState = {
      attributeValues: [{ name: 'FOR', value: 1 }],
      showAttributes: true,
      showWeaklingBanner: false,
      countdown: 3
    };
    expect(state.attributeValues[0].name).toBe('FOR');
    expect(typeof state.countdown).toBe('number');
  });
});
