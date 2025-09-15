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

/**
 * Array of death phrases for variety when characters have insufficient attributes
 */
export const DEATH_PHRASES = [
  'Não sobreviveria por muito tempo no Breu.',
  'O Breu consumiu mais uma alma perdida.',
  'As trevas do Breu são impiedosas com os fracos.',
  'Seus atributos não resistiriam ao horror do Breu.',
  'O vazio do Breu reclama outro infortunado.',
  'Muito fraco para enfrentar os pesadelos do Breu.',
  'O Breu devora aqueles que não estão preparados.',
  'Suas forças se esvaem nas sombras do Breu.',
  'O terror do Breu é maior que sua resistência.',
  'Condenado a perecer nas profundezas do Breu.',
  'Os horrores do Breu superam sua capacidade.',
  'Engolido pela escuridão infinita do Breu.'
] as const;

/**
 * Gets a random death phrase from the available collection
 */
export function getRandomDeathPhrase(): string {
  const randomIndex = Math.floor(Math.random() * DEATH_PHRASES.length);
  return DEATH_PHRASES[randomIndex];
}
