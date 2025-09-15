/**
 * Type definitions for RPG Character Roller
 */

export interface Attribute {
  name: string;
  value: number;
}

export interface CharacterRollerState {
  attributeValues: Attribute[];
  showAttributes: boolean;
  showDeathBanner: boolean;
  countdown: number;
}

export type AttributeName = 'FOR' | 'DES' | 'CON' | 'INT' | 'SAB' | 'CAR';
