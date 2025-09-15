# RPG Character Roller - Test Specification

## Overview
Comprehensive test coverage for the RPG Character Roller application, including unit tests, integration tests, and user interaction scenarios.

## Test Categories

### 1. **Core Functionality Tests**

#### Attribute Generation
- ✅ Generates 6 attributes (FOR, DES, CON, INT, SAB, CAR)
- ✅ Uses 1d4-1d4 formula for each attribute
- ✅ Displays attribute values correctly
- ✅ Calculates attribute sum accurately

#### Dice Rolling Mock Scenarios
```typescript
// Positive outcome (survival)
mockDiceRoll.mockReturnValue({ total: 2 });

// Negative outcome (death)
mockDiceRoll.mockReturnValue({ total: -2 });

// Mixed outcomes
const values = [1, -2, 0, 3, -1, 2]; // Sum = 3 (survival)
const values = [-2, -1, -1, 0, 0, 0]; // Sum = -4 (death)
```

### 2. **Death Banner System Tests**

#### Death Trigger Conditions
- ✅ Shows banner when attribute sum < 0
- ✅ Does NOT show banner when sum ≥ 0
- ✅ Displays correct death message with skull emoji
- ✅ Shows countdown timer (5 seconds)

#### Countdown Behavior
- ✅ Starts at 5 seconds
- ✅ Decreases by 1 every second
- ✅ Updates display text correctly
- ✅ Shows progress bar with accurate percentage
- ✅ Auto-generates new character when countdown reaches 0

#### Visual Progress Bar
```typescript
// Progress calculation: ((5 - countdown) / 5) * 100
countdown: 5 → progress: 0%
countdown: 4 → progress: 20%
countdown: 3 → progress: 40%
countdown: 2 → progress: 60%
countdown: 1 → progress: 80%
countdown: 0 → progress: 100%
```

### 3. **Button Interaction Tests**

#### Normal State
- ✅ Button is clickable
- ✅ Has hover effects
- ✅ Normal cursor pointer
- ✅ Generates attributes on click

#### Disabled State (During Death Countdown)
- ✅ Button is disabled (`disabled={showDeathBanner}`)
- ✅ Has reduced opacity (50%)
- ✅ Shows "not-allowed" cursor
- ✅ Cannot be clicked during countdown
- ✅ Re-enables after countdown completes

### 4. **Timer Management Tests**

#### Timer Lifecycle
- ✅ Creates interval when death banner shows
- ✅ Clears interval when countdown completes
- ✅ Clears interval on component unmount
- ✅ Handles multiple rapid clicks correctly

#### Memory Leak Prevention
```typescript
// Cleanup test
const clearIntervalSpy = vi.spyOn(global, 'clearInterval');
unmount();
expect(clearIntervalSpy).toHaveBeenCalled();
```

### 5. **Accessibility Tests**

#### ARIA Attributes
- ✅ Main has `aria-label="Aplicação geradora de atributos"`
- ✅ Button has proper `aria-label` and `aria-describedby`
- ✅ Death banner has `role="alert"` and `aria-live="assertive"`
- ✅ Skip link for keyboard navigation

#### Screen Reader Support
- ✅ Death banner announces immediately
- ✅ Countdown updates are announced
- ✅ Button state changes are communicated

### 6. **Edge Cases & Error Handling**

#### Extreme Dice Outcomes
- ✅ All minimum values (-3 each, sum = -18)
- ✅ All maximum values (+3 each, sum = +18)
- ✅ Mixed extreme values (sum = 0)

#### Rapid User Interactions
- ✅ Multiple button clicks during countdown
- ✅ Component unmount during active timer
- ✅ Re-generation cycles (death → survival → death)

### 7. **Integration Tests**

#### Full User Workflow
1. ✅ Load page → See title and button
2. ✅ Click button → Generate attributes
3. ✅ If sum < 0 → Death banner appears
4. ✅ Wait 5 seconds → Auto re-generation
5. ✅ Continue until viable character

#### Mock Scenarios
```typescript
// Scenario 1: Immediate success
DiceRoll.mockReturnValue({ total: 1 });

// Scenario 2: Death then success
let callCount = 0;
DiceRoll.mockImplementation(() => ({
  total: callCount < 6 ? -2 : 1 // First roll dies, second survives
}));

// Scenario 3: Multiple death cycles
const outcomes = [-2, -2, -2, -2, -2, -2, 1, 1, 1, 1, 1, 1];
```

### 8. **Performance Tests**

#### Web Vitals Integration
- ✅ Tracks dice animation performance
- ✅ Monitors font loading
- ✅ Reports to Sentry correctly

### 9. **Visual Regression Tests**

#### Component States
- ✅ Initial state (title + button)
- ✅ Attributes displayed state
- ✅ Death banner state
- ✅ Countdown progress state
- ✅ Button disabled state

## Test Commands

```bash
# Run all tests
bun test

# Run specific test file
bun test src/routes/page.unit.test.ts

# Run with coverage
bun test --coverage

# Watch mode for development
bun test --watch
```

## Mock Strategy

### RPG Dice Roller
```typescript
vi.mock('rpg-dice-roller', () => ({
  DiceRoll: vi.fn().mockImplementation((formula) => ({
    total: mockValue // Controlled test value
  }))
}));
```

### Web Vitals
```typescript
vi.mock('$lib/web-vitals', () => ({
  initWebVitals: vi.fn(),
  trackDiceAnimationPerformance: vi.fn(() => ({ end: vi.fn() })),
  trackFontLoadingPerformance: vi.fn()
}));
```

## Expected Test Coverage

- **Statements**: > 90%
- **Branches**: > 85%
- **Functions**: > 95%
- **Lines**: > 90%

## Critical Test Scenarios

### High Priority
1. ✅ Death detection and banner display
2. ✅ Countdown timer accuracy
3. ✅ Button state management
4. ✅ Auto re-generation workflow

### Medium Priority
1. ✅ Accessibility compliance
2. ✅ Performance tracking
3. ✅ Error handling

### Low Priority
1. ✅ Visual styling tests
2. ✅ Animation timing
3. ✅ Font loading metrics
