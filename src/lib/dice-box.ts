// Revised DiceBox wrapper using the actual API pattern from provided example.
// Provides promise-based roll resolution and graceful fallback detection.

interface DiceBoxInstance {
  initialize: () => Promise<void>;
  roll: (notation: string) => void;
  updateConfig: (cfg: Record<string, unknown>) => void;
  clear?: () => void;
  onRollComplete?: (results: unknown) => void;
}

interface RawResultDie { value?: number; result?: number; sides?: number; faces?: number }

export interface VisualRollResult { dice: Array<{ sides: number; value: number }> }

export interface DiceBoxOptions {
  selector: string;
  theme_customColorset?: {
    background?: string | string[];
    foreground?: string;
    texture?: string;
    material?: string;
  };
  light_intensity?: number;
  gravity_multiplier?: number;
  baseScale?: number;
  strength?: number;
  strength_input?: number;
}

let diceBox: DiceBoxInstance | null = null;
let diceBoxBlue: DiceBoxInstance | null = null;
let diceBoxRed: DiceBoxInstance | null = null;
let initializing = false;
let initialized = false;
let lastInitError: unknown = null;
let rolling = false;

// Color constants for dice themes
const DICE_BLUE_BG = '#1e3a8a'; // dark indigo
const DICE_RED_BG = '#991b1b';  // dark red
const DICE_PIPS_LIGHT = '#fff';

type Resolver = (results: unknown) => void;
const pendingResolvers: Resolver[] = [];
const instanceResolvers = new Map<DiceBoxInstance, Resolver[]>();

export async function initDiceBox(options: DiceBoxOptions): Promise<void> {
  if (initialized || initializing) return;
  initializing = true;
  lastInitError = null;
  try {
    const mod = await import('@3d-dice/dice-box-threejs');
    type DiceBoxCtor = new (selector: string, config: Record<string, unknown>) => DiceBoxInstance;
    const imported: Record<string, unknown> = mod as unknown as Record<string, unknown>;
    const DiceBoxClass: DiceBoxCtor = (imported.default as DiceBoxCtor) || (imported.DiceBox as DiceBoxCtor);
    diceBox = new DiceBoxClass(options.selector, {
      ...options,
      // Force custom colorset and neutral material/texture so dice show true colors
      theme_material: 'plastic',
      onRollComplete: (results: unknown) => internalComplete(results)
    });
    await diceBox.initialize();
    initialized = true;
  } catch (e) {
    lastInitError = e;
    console.warn('[DiceBox] initialization failed:', e);
    diceBox = null;
  } finally {
    initializing = false;
  }
}

export function isDiceBoxInitialized(): boolean { return initialized }
export function isDiceBoxRolling(): boolean { return rolling }
export function getDiceBoxInitError(): unknown { return lastInitError }

/** Initialize two overlaid DiceBoxes (blue and red) for guaranteed per-group coloring */
export async function initDiceBoxDual(selectors: { blue: string; red: string }): Promise<void> {
  if (initialized || initializing) return;
  initializing = true;
  lastInitError = null;
  try {
    const mod = await import('@3d-dice/dice-box-threejs');
    type DiceBoxCtor = new (selector: string, config: Record<string, unknown>) => DiceBoxInstance;
    const imported: Record<string, unknown> = mod as unknown as Record<string, unknown>;
    const DiceBoxClass: DiceBoxCtor = (imported.default as DiceBoxCtor) || (imported.DiceBox as DiceBoxCtor);
    const common = {
      theme_material: 'plastic',
      theme_texture: 'none'
    } as const;

    diceBoxBlue = new DiceBoxClass(selectors.blue, {
      ...common,
      onRollComplete: (results: unknown) => internalCompleteFor(diceBoxBlue!, results)
    });
    diceBoxRed = new DiceBoxClass(selectors.red, {
      ...common,
      onRollComplete: (results: unknown) => internalCompleteFor(diceBoxRed!, results)
    });
    await Promise.all([diceBoxBlue.initialize(), diceBoxRed.initialize()]);
    // Pre-apply darker themes so the first roll uses the desired colors
  updateDiceThemeFor(diceBoxBlue, { background: DICE_BLUE_BG, foreground: DICE_PIPS_LIGHT, material: 'plastic', texture: 'none' });
  updateDiceThemeFor(diceBoxRed, { background: DICE_RED_BG, foreground: DICE_PIPS_LIGHT, material: 'plastic', texture: 'none' });
    initialized = true;
  } catch (e) {
    lastInitError = e;
    console.warn('[DiceBoxDual] initialization failed:', e);
    diceBoxBlue = null;
    diceBoxRed = null;
  } finally {
    initializing = false;
  }
}

export async function rollVisual(notation: string, timeoutMs = 4000): Promise<VisualRollResult> {
  if (!diceBox || !initialized) throw new Error('DiceBox not initialized');
  if (rolling) throw new Error('A visual roll is already in progress');
  rolling = true;
  return new Promise<VisualRollResult>((resolve, reject) => {
    const timeout = setTimeout(() => {
      rolling = false;
      reject(new Error('Visual roll timed out'));
    }, timeoutMs);

    pendingResolvers.push((results) => {
      clearTimeout(timeout);
      rolling = false;
      try {
        resolve(normalizeResults(results));
      } catch (err) {
        reject(err as Error);
      }
    });

    try {
      diceBox?.roll(notation);
    } catch (e) {
      clearTimeout(timeout);
      rolling = false;
      reject(e as Error);
    }
  });
}

function rollVisualOn(instance: DiceBoxInstance, notation: string, timeoutMs = 4000): Promise<VisualRollResult> {
  if (!instance) return Promise.reject(new Error('DiceBox instance not available'));
  return new Promise<VisualRollResult>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Visual roll timed out'));
    }, timeoutMs);
    const list = instanceResolvers.get(instance) ?? [];
    list.push((results) => {
      clearTimeout(timeout);
      try {
        resolve(normalizeResults(results));
      } catch (err) {
        reject(err as Error);
      }
    });
    instanceResolvers.set(instance, list);
    try {
      instance.roll(notation);
    } catch (e) {
      clearTimeout(timeout);
      reject(e as Error);
    }
  });
}

export async function rollAttributesVisual(attributeCount: number): Promise<number[]> {
  const values: number[] = [];
  for (let i = 0; i < attributeCount; i++) {
    const first = await rollVisual('1d4');
    const second = await rollVisual('1d4');
    const a = first.dice[0]?.value ?? 0;
    const b = second.dice[0]?.value ?? 0;
    values.push(a - b);
  }
  return values;
}

/**
 * Update DiceBox theme colors. Useful to distinguish dice colors between rolls.
 */
export function updateDiceTheme(opts: { background?: string | string[]; foreground?: string; texture?: string; material?: string }) {
  if (!diceBox) return;
  diceBox.updateConfig({
    // Apply global material/texture to avoid glass tinting colors
    theme_colorset: 'custom',
    theme_material: opts.material ?? 'plastic',
    theme_texture: opts.texture ?? 'none',
    theme_customColorset: {
      background: opts.background,
      foreground: opts.foreground,
      texture: opts.texture ?? 'none',
      material: opts.material ?? 'plastic'
    }
  });
}

function updateDiceThemeFor(instance: DiceBoxInstance | null, opts: { background?: string | string[]; foreground?: string; texture?: string; material?: string }) {
  if (!instance) return;
  instance.updateConfig({
    theme_colorset: 'custom',
    theme_material: opts.material ?? 'plastic',
    theme_texture: opts.texture ?? 'none',
    theme_customColorset: {
      background: opts.background,
      foreground: opts.foreground,
      texture: opts.texture ?? 'none',
      material: opts.material ?? 'plastic'
    }
  });
}

/**
 * Batched attribute roll: rolls N d4 as RED, then N d4 as BLUE, and returns BLUE - RED for each pair.
 */
export async function rollAttributesVisualBatched(attributeCount: number): Promise<number[]> {
  // Roll RED batch
  updateDiceTheme({ background: DICE_RED_BG, foreground: DICE_PIPS_LIGHT });
  const red = await rollVisual(`${attributeCount}d4`);

  // Roll BLUE batch
  updateDiceTheme({ background: DICE_BLUE_BG, foreground: DICE_PIPS_LIGHT });
  const blue = await rollVisual(`${attributeCount}d4`);

  const reds = red.dice.map((d) => d.value ?? 0);
  const blues = blue.dice.map((d) => d.value ?? 0);

  const values: number[] = [];
  for (let i = 0; i < attributeCount; i++) {
    const r = reds[i] ?? 0;
    const b = blues[i] ?? 0;
    values.push(b - r);
  }
  console.log(values);
  return values;
}

/**
 * One-pass attribute roll with forced outcomes: use predetermined faces for BLUE first then RED.
 * Ensures visual dice exactly match the logical results used to compute attributes.
 */
/**
 * Drive two overlaid DiceBoxes with predetermined faces for each color.
 * - Blue and Red arrays can be different lengths; both will be rolled visually as provided.
 * - The returned array contains pairwise differences (blue - red) up to the shorter length.
 */
export async function rollDices(blueFaces: number[], redFaces: number[]): Promise<number[]> {
  const nBlue = blueFaces.length;
  const nRed = redFaces.length;
  const n = Math.min(nBlue, nRed);
  if (!(diceBoxBlue && diceBoxRed && initialized)) throw new Error('Dual DiceBox not initialized');

  // Update themes per instance
  updateDiceThemeFor(diceBoxBlue, { background: DICE_BLUE_BG, foreground: DICE_PIPS_LIGHT, material: 'plastic', texture: 'none' });
  updateDiceThemeFor(diceBoxRed, { background: DICE_RED_BG, foreground: DICE_PIPS_LIGHT, material: 'plastic', texture: 'none' });

  const blueNotation = `${nBlue}d4@${blueFaces.join(',')}`;
  const redNotation = `${nRed}d4@${redFaces.join(',')}`;

  if (rolling) throw new Error('A visual roll is already in progress');
  rolling = true;
  try {
    const [blueResult, redResult] = await Promise.all([
      rollVisualOn(diceBoxBlue, blueNotation),
      rollVisualOn(diceBoxRed, redNotation)
    ]);
    const values: number[] = [];
    for (let i = 0; i < n; i++) {
      const b = blueResult.dice[i]?.value ?? 0;
      const r = redResult.dice[i]?.value ?? 0;
      values.push(b - r);
    }
    return values;
  } finally {
    rolling = false;
  }
}

function internalComplete(results: unknown) {
  while (pendingResolvers.length) {
    const r = pendingResolvers.shift();
    r?.(results);
  }
}

function internalCompleteFor(instance: DiceBoxInstance, results: unknown) {
  const list = instanceResolvers.get(instance);
  if (!list || list.length === 0) return;
  const r = list.shift();
  r?.(results);
}

/** Clear both canvases if available (dual mode) or single instance otherwise */
export function clearDice(): void {
  try { diceBoxBlue?.clear?.(); } catch { /* noop */ }
  try { diceBoxRed?.clear?.(); } catch { /* noop */ }
  try { diceBox?.clear?.(); } catch { /* noop */ }
}

function normalizeResults(raw: unknown): VisualRollResult {
  if (Array.isArray(raw)) return { dice: raw.map((d) => normalizeDie(d)) };
  if (raw && typeof raw === 'object') {
    const maybe = raw as Record<string, unknown>;
    if (Array.isArray(maybe.results)) return { dice: maybe.results.map((d) => normalizeDie(d)) };
  }
  return { dice: [] };
}

function normalizeDie(d: unknown): { sides: number; value: number } {
  if (!d || typeof d !== 'object') return { sides: 0, value: 0 };
  const die = d as RawResultDie;
  return {
    sides: die.sides ?? die.faces ?? 0,
    value: die.value ?? die.result ?? 0
  };
}
