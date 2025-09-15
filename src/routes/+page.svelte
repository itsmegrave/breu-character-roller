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

<svelte:head>
  <title>[BREU] - Gerador de Personagens</title>
  <meta name="description" content="Gerador de atributos para personagens de RPG usando dados 1d4-1d4" />
</svelte:head>

<main class="flex min-h-screen flex-col items-center justify-center" aria-label="Aplicação geradora de atributos">
  <a href="#page-title" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded">
    Pular para conteúdo principal
  </a>

  <h1 class="mb-8 text-center text-6xl tracking-wide text-white" id="page-title">
    Gerador de Atributos para Breu
  </h1>

  <button
    class="cursor-pointer rounded-lg border-2 border-white bg-black px-10 py-4 text-2xl text-white transition-colors duration-200 hover:bg-white hover:text-black focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
    onclick={rollAttributes}
    aria-describedby="page-title"
    aria-label="Rolar dados para gerar atributos de personagem"
    aria-expanded={showAttributes}
    aria-controls={showAttributes ? "attributes-section" : undefined}
    type="button"
  >
    Encare o Breu
  </button>

  <div
    class="mt-8 h-0.5 w-4/5 bg-white"
    role="separator"
    aria-hidden="true"
  ></div>

  {#if showAttributes}
    <section
      id="attributes-section"
      class="mt-8 w-4/5 max-w-md border-2 border-white p-6"
      aria-labelledby="attributes-heading"
      aria-live="polite"
    >
      <h2 id="attributes-heading" class="sr-only">
        Atributos gerados para o personagem
      </h2>
      <div class="space-y-4" role="list" aria-label="Lista de atributos do personagem"
           aria-describedby="attributes-description">
        <div id="attributes-description" class="sr-only">
          Seis atributos foram gerados usando dados 1d4 menos 1d4, resultando em valores entre -3 e +3
        </div>
        {#each attributeValues as attribute (attribute.name)}
          <div
            class="flex items-center justify-between"
            role="listitem"
            aria-label="Atributo {attribute.name}"
          >
            <span
              class="text-4xl text-white"
              style="font-family: var(--font-bondrians);"
              id="attr-{attribute.name.toLowerCase()}"
              aria-label="Nome do atributo: {attribute.name}"
            >
              {attribute.name}
            </span>
            <div
              class="flex h-16 w-16 items-center justify-center border border-white"
              role="status"
              aria-labelledby="attr-{attribute.name.toLowerCase()}"
              aria-live="polite"
            >
              <span
                class="text-2xl text-white"
                style="font-family: var(--font-bondrians);"
                aria-label="Valor do atributo {attribute.name}: {attribute.value}"
              >
                {attribute.value ?? 0}
              </span>
            </div>
          </div>
        {/each}
      </div>
    </section>
  {/if}
</main>
