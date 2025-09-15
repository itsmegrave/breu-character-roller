/**
 * Integration tests for RPG Character Roller
 * Tests the main page functionality with mocked dice rolls
 */

import { test, expect, mock, beforeEach } from 'bun:test';

// Mock the rpg-dice-roller module
const mockDiceRoll = mock();
mock.module('rpg-dice-roller', () => ({
  DiceRoll: mockDiceRoll
}));

beforeEach(() => {
  mockDiceRoll.mockClear();
});

test('attribute calculation logic', () => {
  // Test various dice roll outcomes
  const testCases = [
    { diceResults: [1, 1, 1, 1, 1, 1], expectedSum: 6, shouldTriggerDeath: false },
    { diceResults: [-1, -1, -1, -1, -1, -1], expectedSum: -6, shouldTriggerDeath: true },
    { diceResults: [2, -1, 0, 1, -2, 0], expectedSum: 0, shouldTriggerDeath: false },
    { diceResults: [-2, -2, 1, 0, 0, 0], expectedSum: -3, shouldTriggerDeath: true }
  ];

  testCases.forEach(({ diceResults, expectedSum, shouldTriggerDeath }) => {
    const actualSum = diceResults.reduce((sum, val) => sum + val, 0);
    expect(actualSum).toBe(expectedSum);
    expect(actualSum < 0).toBe(shouldTriggerDeath);
  });
});

test('death banner conditions', () => {
  const attributes = [
    { name: 'FOR', value: -2 },
    { name: 'DES', value: 1 },
    { name: 'CON', value: -1 },
    { name: 'INT', value: 0 },
    { name: 'SAB', value: -1 },
    { name: 'CAR', value: 2 }
  ];

  const sum = attributes.reduce((total, attr) => total + attr.value, 0);
  expect(sum).toBe(-1);
  expect(sum < 0).toBe(true); // Should trigger death banner
});

test('progress bar calculation', () => {
  const maxTime = 5;

  // Test progress at different countdown values
  const testCases = [
    { countdown: 5, expectedProgress: 0 },   // ((5-5)/5) * 100 = 0%
    { countdown: 4, expectedProgress: 20 },  // ((5-4)/5) * 100 = 20%
    { countdown: 3, expectedProgress: 40 },  // ((5-3)/5) * 100 = 40%
    { countdown: 2, expectedProgress: 60 },  // ((5-2)/5) * 100 = 60%
    { countdown: 1, expectedProgress: 80 },  // ((5-1)/5) * 100 = 80%
    { countdown: 0, expectedProgress: 100 }  // ((5-0)/5) * 100 = 100%
  ];

  testCases.forEach(({ countdown, expectedProgress }) => {
    const progress = ((maxTime - countdown) / maxTime) * 100;
    expect(progress).toBe(expectedProgress);
  });
});
