import { DiceRoll } from 'rpg-dice-roller';
import { trackDiceAnimationPerformance } from '$lib/metrics/web-vitals';
import type { Attribute, AttributeName } from '$lib/types';

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

  setRolling(value: boolean) {
    this.rolling = value;
  }

  get isRolling(): boolean {
    return this.rolling;
  }

  private startDeathCountdown(): void {
    this.clearCountdown();

    let countdown = DEATH_COUNTDOWN_SECONDS;
    this.onDeathBannerShow(countdown);

    // Trigger visual roll at countdown start if provided
    try { this.onDeathVisualRoll?.(); } catch { /* noop */ }

    this.countdownInterval = setInterval(() => {
      countdown--;
      this.onCountdownUpdate(countdown);

      if (countdown <= 0) {
        this.clearCountdown();
        this.onDeathBannerHide();
        Promise.resolve(this.onRegenerateAfterDeath?.()).finally(() => {
          this.generateCharacter();
        });
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
