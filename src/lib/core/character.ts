import { DiceRoll } from 'rpg-dice-roller';
import { trackDiceAnimationPerformance } from '$lib/metrics/web-vitals';
import type { Attribute, AttributeName } from '$lib/types';
import { isDiceBoxInitialized, rollDices } from '$lib/dice';

export const DICE_FORMULA = '1d4-1d4';
export const ATTRIBUTES: AttributeName[] = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'];
export const DEATH_COUNTDOWN_SECONDS = 5;

export function createInitialAttributes(): Attribute[] {
  return ATTRIBUTES.map((name) => ({ name, value: 0 }));
}

export function rollSingleAttribute(): number {
  const roll = new DiceRoll(DICE_FORMULA);
  return roll.total;
}

export function generateAttributes(): { attributes: Attribute[]; performanceEnd: () => number } {
  const performanceTracker = trackDiceAnimationPerformance();
  try {
    const attributes = ATTRIBUTES.map((name) => ({ name, value: rollSingleAttribute() }));
    return { attributes, performanceEnd: performanceTracker.end };
  } catch (error) {
    console.error('Error generating attributes:', error);
    performanceTracker.end();
    throw error;
  }
}

export function calculateAttributeSum(attributes: Attribute[]): number {
  return attributes.reduce((sum, attr) => sum + attr.value, 0);
}

export function shouldTriggerDeath(attributes: Attribute[]): boolean {
  return calculateAttributeSum(attributes) < 0;
}

export function calculateCountdownProgress(countdown: number, maxTime: number = DEATH_COUNTDOWN_SECONDS): number {
  return ((maxTime - countdown) / maxTime) * 100;
}

export class CharacterGenerator {
  private countdownInterval: ReturnType<typeof setInterval> | null = null;
  private rolling = false;

  constructor(
    private onAttributesGenerated: (attributes: Attribute[]) => void,
    private onWeaklingBannerShow: (countdown: number) => void,
    private onWeaklingBannerHide: () => void,
    private onCountdownUpdate: (countdown: number) => void
  ) {}

  generateCharacter(): void {
    if (this.rolling) return;
    const { attributes, performanceEnd } = generateAttributes();
    this.processAttributes(attributes, performanceEnd);
  }

  processAttributes(attributes: Attribute[], performanceEnd?: () => number): void {
    this.onAttributesGenerated(attributes);
    if (shouldTriggerDeath(attributes)) {
      this.startDeathCountdown();
    }
    performanceEnd?.();
    this.rolling = false;
  }

  /**
   * Generates a character while driving the visual dice roll if available.
   * UI components (overlay, buttons) remain the page's responsibility.
   */
  async generateCharacterWithVisuals(): Promise<void> {
    if (this.rolling) return;
    // If dice visuals aren't available, fallback to logical generation
    if (!isDiceBoxInitialized()) {
      this.generateCharacter();
      return;
    }

    this.setRolling(true);

    // Compute faces deterministically with DiceRoll (source of truth)
    const blues: number[] = [];
    const reds: number[] = [];
    const values: number[] = [];
    for (let i = 0; i < ATTRIBUTES.length; i++) {
      const bRoll = new DiceRoll('1d4');
      const rRoll = new DiceRoll('1d4');
      const b = Number(bRoll.total);
      const r = Number(rRoll.total);
      blues.push(b);
      reds.push(r);
      values.push(b - r);
    }

    const perf = trackDiceAnimationPerformance();
    try {
      await rollDices(blues, reds);
      const attributes: Attribute[] = ATTRIBUTES.map((name, idx) => ({ name, value: values[idx] ?? 0 }));
      this.processAttributes(attributes, perf.end);
    } catch (err) {
      console.error('Visual dice roll failed, fallback to logical:', err);
      // Ensure perf timer is closed on error as well
  try { perf.end(); } catch (perfErr) { console.error('Error ending performance timer:', perfErr); }
      this.generateCharacter();
    } finally {
      this.setRolling(false);
    }
  }

  setRolling(value: boolean) {
    this.rolling = value;
  }

  get isRolling(): boolean {
    return this.rolling;
  }

  private startDeathCountdown(): void {
    this.clearCountdown();

    let countdown = DEATH_COUNTDOWN_SECONDS;
  this.onWeaklingBannerShow(countdown);

    this.countdownInterval = setInterval(() => {
      countdown--;
      this.onCountdownUpdate(countdown);

      if (countdown <= 0) {
        this.clearCountdown();
  this.onWeaklingBannerHide();
        this.generateCharacter();
      }
    }, 1000);
  }

  clearCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
      this.countdownInterval = null;
    }
  }

  destroy(): void {
    this.clearCountdown();
  }

  get isInDeathCountdown(): boolean {
    return this.countdownInterval !== null;
  }
}
