<script lang="ts">
  import { DiceRoll } from 'rpg-dice-roller';
  import { initWebVitals, trackDiceAnimationPerformance, trackFontLoadingPerformance } from '$lib/web-vitals';
  import { onMount, onDestroy } from 'svelte';

  const DICE_FORMULA = '1d4-1d4';
  const ATTRIBUTES = ['FOR', 'DES', 'CON', 'INT', 'SAB', 'CAR'];

  const createInitialAttributes = () => ATTRIBUTES.map((name) => ({ name, value: 0 }));

  let attributeValues = $state(createInitialAttributes());
  let showAttributes = $state(false);
  let showDeathBanner = $state(false);
  let countdown = $state(5);
  let countdownInterval: number | null = null;

  onMount(() => {
    initWebVitals();
    trackFontLoadingPerformance();
  });

  onDestroy(() => {
    if (countdownInterval) {
      clearInterval(countdownInterval);
    }
  });

  const rollSingleAttribute = () => {
    const roll = new DiceRoll(DICE_FORMULA);
    return roll.total;
  };

  const rollAttributes = () => {
    const performanceTracker = trackDiceAnimationPerformance();

    try {
      const newAttributes = attributeValues.map((attr) => ({
        ...attr,
        value: rollSingleAttribute()
      }));

      attributeValues = newAttributes;
      showAttributes = true;

      const attributesTotal = newAttributes.reduce((sum, attr) => sum + attr.value, 0);

      if (attributesTotal < 0) {
        showDeathBanner = true;
        countdown = 5;

        if (countdownInterval) {
          clearInterval(countdownInterval);
        }

        countdownInterval = setInterval(() => {
          countdown--;
          if (countdown <= 0) {
            clearInterval(countdownInterval!);
            countdownInterval = null;
            showDeathBanner = false;
            // Automatically re-generate attributes
            rollAttributes();
          }
        }, 1000);
      }

      performanceTracker.end();

    } catch (error) {
      console.error('Error generating attributes:', error);
      performanceTracker.end();
    }
  };
</script>

<svelte:head>
  <title>[BREU] - Gerador de Atributos</title>
  <meta name="description" content="Gerador de atributos para personagens do RPG Breu" />
</svelte:head>

<div class="m-8">
  <main class="flex min-h-screen flex-col items-center justify-center" aria-label="Aplicação geradora de atributos">
  <a href="#page-title" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-black focus:rounded">
    Pular para conteúdo principal
  </a>

  <h1 class="mb-8 text-center text-6xl tracking-wide text-white" id="page-title">
    Gerador de Atributos
  </h1>

  <button
    class="rounded-lg border-2 border-white bg-black px-10 py-4 text-2xl text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white {showDeathBanner ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white hover:text-black'}"
    onclick={rollAttributes}
    disabled={showDeathBanner}
    aria-describedby="page-title"
    aria-label="Rolar dados para gerar atributos de personagem"
    aria-expanded={showAttributes}
    aria-controls={showAttributes ? "attributes-section" : undefined}
    type="button"
  >
    Encare o Breu
  </button>

  <div
    class="mt-8 h-0.5 w-full bg-white"
    role="separator"
    aria-hidden="true"
  ></div>

  {#if showDeathBanner}
    <div
      class="mt-8 w-full bg-white border-2 border-white p-6 text-center animate-pulse mx-4"
      role="alert"
      aria-live="assertive"
      aria-atomic="true"
    >
      <p class="text-2xl text-black mb-4" style="font-family: var(--font-bondrians);">
        💀 Não sobreviveria por muito tempo no Breu.
      </p>
      <p class="text-lg text-gray-700" style="font-family: var(--font-encode-sans);">
        Gerando novo personagem em {countdown}s...
      </p>
      <div class="mt-4 w-full bg-gray-300 rounded-full h-2">
        <div
          class="bg-black h-2 rounded-full transition-all duration-1000"
          style="width: {((5 - countdown) / 5) * 100}%"
        ></div>
      </div>
    </div>
  {/if}

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


  <footer class="mt-auto pt-8 pb-4 text-left text-white w-full" style="font-family: var(--font-encode-sans);">
    <div
    class="mt-8 h-0.5 w-full bg-white"
    role="separator"
    aria-hidden="true"
  ></div>
    <p class="text-sm">
      Feito com <span class="text-purple-400" aria-label="coração roxo">💜</span> por
      <a
        href="https://github.com/itsmegrave"
        target="_blank"
        rel="noopener noreferrer"
        class="text-purple-400 hover:text-purple-300 transition-colors duration-200"
        aria-label="Perfil do GitHub de itsmegrave (abre em nova aba)"
      >
        itsmegrave
      </a>. Esse gerador é open source e você pode conferir o código no
      <a
        href="https://github.com/itsmegrave/breu-character-roller"
        target="_blank"
        rel="noopener noreferrer"
        class="text-purple-400 hover:text-purple-300 transition-colors duration-200"
        aria-label="Repositório do GitHub de breu-character-roller (abre em nova aba)"
      >
        GitHub
      </a>.
      <br/>
      Feito pela comunidade, para a comunidade.
    </p>
  </footer>
</main>
</div>
