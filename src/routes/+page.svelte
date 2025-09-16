<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { initWebVitals, trackFontLoadingPerformance } from '$lib/web-vitals';
  import { CharacterGenerator, calculateCountdownProgress, ATTRIBUTES } from '$lib/character-generator';
  import { DiceRoll } from 'rpg-dice-roller';
  import { getRandomDeathPhrase } from '$lib/types';
  import type { Attribute } from '$lib/types';
  import { initDiceBoxDual, rollAttributesVisualOnePassForced, isDiceBoxInitialized, isDiceBoxRolling, clearDice } from '$lib/dice-box';

  let attributeValues = $state<Attribute[]>([]);
  let showAttributes = $state(false);
  let showDeathBanner = $state(false);
  let countdown = $state(5);
  let currentDeathPhrase = $state('');

  let characterGenerator = $state<CharacterGenerator>();

  // Dual DiceBox renders into two overlaid elements for BLUE and RED
  let diceBlueEl: HTMLDivElement | null = null;
  let diceRedEl: HTMLDivElement | null = null;
  let showDiceOverlay = $state(false);
  let overlayHideTimer: number | null = null;
  let isRollingVisual = $state(false);
  let diceInitFailed = $state(false);

  onMount(async () => {
    initWebVitals();
    trackFontLoadingPerformance();

    characterGenerator = new CharacterGenerator(
      (attributes: Attribute[]) => {
        attributeValues = attributes;
        showAttributes = true;
      },
      (initialCountdown: number) => {
        currentDeathPhrase = getRandomDeathPhrase();
        showDeathBanner = true;
        countdown = initialCountdown;
      },
      () => {
        showDeathBanner = false;
      },
      (newCountdown: number) => {
        countdown = newCountdown;
      },
      async () => {
        // Visual roll at death start (does not change attributes)
        if (!isDiceBoxInitialized()) return;
        const blues: number[] = [];
        const reds: number[] = [];
        for (let i = 0; i < ATTRIBUTES.length; i++) {
          blues.push(Math.ceil(Math.random() * 4));
          reds.push(Math.ceil(Math.random() * 4));
        }
        showDiceOverlay = true;
        if (overlayHideTimer) clearTimeout(overlayHideTimer);
  overlayHideTimer = setTimeout(() => { showDiceOverlay = false; overlayHideTimer = null; clearDice(); }, 3000) as unknown as number;
        try {
          await rollAttributesVisualOnePassForced(blues, reds);
        } catch (e) {
          console.warn('Death visual roll skipped:', e);
        }
      },
      async () => {
        // After countdown finishes, roll dice again to "reload" visually, then generator will regenerate logically
        if (!isDiceBoxInitialized()) return;
        const blues: number[] = [];
        const reds: number[] = [];
        for (let i = 0; i < ATTRIBUTES.length; i++) {
          blues.push(Math.ceil(Math.random() * 4));
          reds.push(Math.ceil(Math.random() * 4));
        }
        showDiceOverlay = true;
        if (overlayHideTimer) clearTimeout(overlayHideTimer);
      overlayHideTimer = setTimeout(() => { showDiceOverlay = false; overlayHideTimer = null; clearDice(); }, 3000) as unknown as number;
        try {
          await rollAttributesVisualOnePassForced(blues, reds);
        } catch (e) {
          console.warn('Post-death visual roll skipped:', e);
        }
      }
    );
    // Initialize dual dice boxes (browser only)
    try {
      await initDiceBoxDual({ blue: '#dice-blue', red: '#dice-red' });
    } catch (e) {
      diceInitFailed = true;
      console.warn('Failed to init dice box, falling back to logical rolls only:', e);
    }
  });

  onDestroy(() => {
    characterGenerator?.destroy();
  });

  async function handleGenerateCharacter() {
    if (!characterGenerator) return;
    if (characterGenerator.isRolling || isRollingVisual) return;
    // If dice box not available, fallback to logical generation
    if (!isDiceBoxInitialized()) {
      characterGenerator.generateCharacter();
      return;
    }

  isRollingVisual = true;
  showDiceOverlay = true;
  if (overlayHideTimer) clearTimeout(overlayHideTimer);
  overlayHideTimer = setTimeout(() => { showDiceOverlay = false; overlayHideTimer = null; clearDice(); }, 3000) as unknown as number;
    characterGenerator.setRolling(true);
    showAttributes = false; // hide old while rolling new

    try {
      // Source of truth: compute faces with DiceRoll (two 1d4 per attribute)
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
      // Animate exactly these faces: BLUE then RED in one pass
      await rollAttributesVisualOnePassForced(blues, reds);
      // Update state from the computed logical values
      const attributes: Attribute[] = ATTRIBUTES.map((name, idx) => ({ name, value: values[idx] ?? 0 }));
      characterGenerator.processAttributes(attributes);
    } catch (err) {
      console.error('Visual dice roll failed, fallback to logical:', err);
      // Reset rolling state before fallback so logical generation proceeds
      characterGenerator.setRolling(false);
      characterGenerator.generateCharacter();
    } finally {
      isRollingVisual = false;
    }
  }
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
  class="rounded-lg border-2 border-white bg-black px-10 py-4 text-2xl text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white {(showDeathBanner || isRollingVisual || characterGenerator?.isRolling || isDiceBoxRolling()) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-white hover:text-black'}"
    onclick={handleGenerateCharacter}
  disabled={showDeathBanner || isRollingVisual || characterGenerator?.isRolling || isDiceBoxRolling()}
    aria-describedby="page-title"
    aria-label="Rolar dados para gerar atributos de personagem"
    aria-expanded={showAttributes}
    aria-controls={showAttributes ? "attributes-section" : undefined}
    type="button"
  >
      Encare o Breu
  </button>
  {#if diceInitFailed}
    <p class="mt-2 text-sm text-red-300" style="font-family: var(--font-encode-sans);">
      Modo visual indisponível. Usando rolagem lógica.
    </p>
  {/if}
  <!-- Dice visualization containers: full-screen overlay (two layers) -->
  <div
    id="dice-blue"
    bind:this={diceBlueEl}
    class={`fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none z-10 transition-opacity duration-700 ease-in-out ${showDiceOverlay ? 'opacity-100' : 'opacity-0'}`}
    aria-hidden="true"
  ></div>
  <div
    id="dice-red"
    bind:this={diceRedEl}
    class={`fixed inset-0 w-screen h-screen overflow-hidden pointer-events-none z-10 transition-opacity duration-700 ease-in-out ${showDiceOverlay ? 'opacity-100' : 'opacity-0'}`}
    aria-hidden="true"
  ></div>

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
        💀 {currentDeathPhrase}
      </p>
      <p class="text-lg text-gray-700" style="font-family: var(--font-encode-sans);">
        Gerando novo personagem em {countdown}s...
      </p>
      <div class="mt-4 w-full bg-gray-300 rounded-full h-2">
        <div
          class="bg-black h-2 rounded-full transition-all duration-1000"
          style="width: {calculateCountdownProgress(countdown)}%"
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
