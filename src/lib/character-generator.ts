import { DiceRoll } from 'rpg-dice-roller';
import { trackDiceAnimationPerformance } from './web-vitals';
import type { Attribute, AttributeName } from './types';

/**
 * RPG Character Generation Logic
 * Handles dice rolling, attribute generation, and death detection
 */

// Constants
export const DICE_FORMULA = '1d4-1d4';
export const ATTRIBUTES: AttributeName[] = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'];
export const DEATH_COUNTDOWN_SECONDS = 5;

/**
 * Creates initial empty attributes structure
 */
export function createInitialAttributes(): Attribute[] {
  return ATTRIBUTES.map((name) => ({ name, value: 0 }));
}

/**
 * Rolls a single attribute value using the dice formula
 */
export function rollSingleAttribute(): number {
  const roll = new DiceRoll(DICE_FORMULA);
  return roll.total;
}

/**
 * Generates all attribute values with performance tracking
 */
export function generateAttributes(): { attributes: Attribute[]; performanceEnd: () => number } {
  // Track dice animation performance
  const performanceTracker = trackDiceAnimationPerformance();

  try {
    const attributes = ATTRIBUTES.map((name) => ({
      name,
      value: rollSingleAttribute()
    }));

    return {
      attributes,
      performanceEnd: performanceTracker.end
    };
  } catch (error) {
    console.error('Error generating attributes:', error);
    performanceTracker.end();
    throw error;
  }
}

/**
 * Calculates the sum of all attribute values
 */
export function calculateAttributeSum(attributes: Attribute[]): number {
  return attributes.reduce((sum, attr) => sum + attr.value, 0);
}

/**
 * Determines if the character should trigger the death banner
 */
export function shouldTriggerDeath(attributes: Attribute[]): boolean {
  return calculateAttributeSum(attributes) < 0;
}

/**
 * Calculates progress bar percentage for countdown
 */
export function calculateCountdownProgress(countdown: number, maxTime: number = DEATH_COUNTDOWN_SECONDS): number {
  return ((maxTime - countdown) / maxTime) * 100;
}

/**
 * Character Generation Manager Class
 * Manages the complete character generation workflow
 */
export class CharacterGenerator {
  private countdownInterval: ReturnType<typeof setInterval> | null = null;
  // Flag to indicate a visual dice roll is currently in progress (to coordinate UI state)
  private rolling = false;
  private onDeathVisualRoll?: () => void;
  private onRegenerateAfterDeath?: () => Promise<void> | void;

  constructor(
    private onAttributesGenerated: (attributes: Attribute[]) => void,
    private onDeathBannerShow: (countdown: number) => void,
    private onDeathBannerHide: () => void,
    private onCountdownUpdate: (countdown: number) => void,
    onDeathVisualRoll?: () => void,
    onRegenerateAfterDeath?: () => Promise<void> | void
  ) {
    this.onDeathVisualRoll = onDeathVisualRoll;
    this.onRegenerateAfterDeath = onRegenerateAfterDeath;
  }

  /**
   * Generates a new character and handles death logic
   */
  generateCharacter(): void {
    if (this.rolling) return; // prevent overlapping rolls
    const { attributes, performanceEnd } = generateAttributes();
    this.processAttributes(attributes, performanceEnd);
  }

  /**
   * Processes a set of attributes (e.g., produced by an external visual dice system)
   * and applies standard post-generation logic (death check, performance tracking end, etc.)
   * @param attributes Generated attributes array
   * @param performanceEnd Optional performance end callback (if external system also tracked perf)
   */
  processAttributes(attributes: Attribute[], performanceEnd?: () => number): void {
    this.onAttributesGenerated(attributes);
    if (shouldTriggerDeath(attributes)) {
      this.startDeathCountdown();
    }
    performanceEnd?.();
    this.rolling = false; // clear rolling state if it was set
  }

  /**
   * Marks the generator as rolling (used by UI before visual dice animation starts)
   */
  setRolling(value: boolean) {
    this.rolling = value;
  }

  /** Returns whether a roll is currently in progress (visual or logical) */
  get isRolling(): boolean {
    return this.rolling;
  }

  /**
   * Starts the death countdown timer
   */
  private startDeathCountdown(): void {
    // Clear any existing interval
    this.clearCountdown();

    let countdown = DEATH_COUNTDOWN_SECONDS;
    this.onDeathBannerShow(countdown);

    this.countdownInterval = setInterval(() => {
      countdown--;
      this.onCountdownUpdate(countdown);

      if (countdown <= 0) {
        this.clearCountdown();
        this.onDeathBannerHide();
        // Allow UI to animate dice after countdown finishes before regenerating
        Promise.resolve(this.onRegenerateAfterDeath?.()).finally(() => {
          this.generateCharacter();
        });
      }
    }, 1000);
  }

  /**
   * Clears the countdown timer
   */
  clearCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  /**
   * Cleanup method for component unmounting
   */
  destroy(): void {
    this.clearCountdown();
  }

  /**
   * Checks if currently in death countdown state
   */
  get isInDeathCountdown(): boolean {
    return this.countdownInterval !== null;
  }
}
