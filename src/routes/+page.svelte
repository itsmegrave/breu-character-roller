<script>
  import { DiceRoll } from 'rpg-dice-roller';

  // Constants
  const DICE_FORMULA = '1d4-1d4';
  const ATTRIBUTES = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'];

  // Create initial attributes structure
  const createInitialAttributes = () => ATTRIBUTES.map((name) => ({ name, value: 0 }));

  // Reactive state using Svelte 5 runes
  let attributeValues = $state(createInitialAttributes());
  let showAttributes = $state(false);

  // Roll a single attribute value
  const rollSingleAttribute = () => {
    const roll = new DiceRoll(DICE_FORMULA);
    return roll.total;
  };

  // Generate all attribute values
  const rollAttributes = () => {
    attributeValues = attributeValues.map((attr) => ({
      ...attr,
      value: rollSingleAttribute()
    }));
    showAttributes = true;
  };
</script>

<div class="flex min-h-screen flex-col items-center justify-center">
  <h1 class="mb-8 text-center text-6xl tracking-wide text-white">Gerador de Atributos</h1>

  <button
    class="cursor-pointer rounded-lg border-2 border-white bg-black px-10 py-4 text-2xl text-white transition-colors duration-200 hover:bg-white hover:text-black"
    onclick={rollAttributes}
  >
    Encare o Breu
  </button>

  <div class="mt-8 h-0.5 w-4/5 bg-white"></div>

  {#if showAttributes}
    <div class="mt-8 w-4/5 max-w-md border-2 border-white p-6">
      <div class="space-y-4">
        {#each attributeValues as attribute (attribute.name)}
          <div class="flex items-center justify-between">
            <span class="text-4xl text-white" style="font-family: var(--font-bondrians);">
              {attribute.name}
            </span>
            <div class="flex h-16 w-16 items-center justify-center border border-white">
              <span class="text-2xl text-white" style="font-family: var(--font-bondrians);">
                {attribute.value ?? ''}
              </span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
