// Minimal type declarations for @3d-dice/dice-box-threejs to satisfy TypeScript without full upstream types.
declare module '@3d-dice/dice-box-threejs' {
  interface DiceBoxConfig {
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
    onRollComplete?: (results: unknown) => void;
    [key: string]: unknown;
  }
  export class DiceBox {
    constructor(selector: string, config?: DiceBoxConfig);
    initialize(): Promise<void>;
    roll(notation: string): void;
    updateConfig(cfg: DiceBoxConfig): void;
    clear?: () => void;
    onRollComplete?: (results: unknown) => void;
  }
  export default DiceBox;
}

// Minimal types for rpg-dice-roller to satisfy TypeScript in this project
declare module 'rpg-dice-roller' {
  export class DiceRoll {
    constructor(notation: string);
    total: number;
  }
}
