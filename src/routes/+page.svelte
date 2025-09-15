
<script>
	import { DiceRoll } from 'rpg-dice-roller';

	// Attribute definitions
	const attributes = [
		{ name: 'FOR', value: 0 },
		{ name: 'DES', value: 0 },
		{ name: 'CON', value: 0 },
		{ name: 'INT', value: 0 },
		{ name: 'SAB', value: 0 },
		{ name: 'CAR', value: 0 }
	];

	// Reactive state using Svelte 5 runes
	let attributeValues = $state(attributes.map(attr => ({ ...attr })));
	let showAttributes = $state(false);

	// Function to generate random attribute values using rpg-dice-roller
	function rollAttributes() {
		attributeValues = attributeValues.map(attr => {
			// Roll 1d4-1d4 for each attribute
			const roll = new DiceRoll('1d4-1d4');
            console.log(roll.total);
			return {
				...attr,
				value: roll.total
			};
		});
		showAttributes = true;
	}
</script>

<div class="flex flex-col items-center justify-center min-h-screen">
	<h1 class="text-6xl mb-8 text-white tracking-wide text-center">Gerador de Atributos</h1>

	<button
		class="bg-black text-white border-2 border-white px-10 py-4 text-2xl rounded-lg cursor-pointer transition-colors duration-200 hover:bg-white hover:text-black"
		onclick={rollAttributes}
	>
		Encare o Breu
	</button>

	<div class="mt-8 w-4/5 h-0.5 bg-white"></div>

	{#if showAttributes}
		<div class="mt-8 border-2 border-white p-6 w-4/5 max-w-md">
			<div class="space-y-4">
				{#each attributeValues as attribute}
					<div class="flex items-center justify-between">
						<span class="text-white text-4xl" style="font-family: var(--font-bondrians);">
							{attribute.name}
						</span>
						<div class="border border-white w-16 h-16 flex items-center justify-center">
							<span class="text-white text-2xl" style="font-family: var(--font-bondrians);">
								{attribute.value ?? ''}
							</span>
						</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
