<script>
	let { showModal = $bindable(), showcls = true, wd, hd, children } = $props();
	let dialog; // reference to the dialog element
	let pdiv; // reference to the content div
	// Use $effect to respond to state changes and call native dialog methods
	$effect(() => {
		if (dialog && wd) {
			dialog.style.width = wd;
		}
		if (dialog && hd) {
			dialog.style.height = hd;
			pdiv.style.height = dialog.offsetHeight * 0.9 + "px";
		}

		if (showModal) {
			dialog.showModal();
		} else {
			dialog.close();
		}
	});
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<dialog
	class="w-[96%] max-h-dvh border rounded-lg p-1 pt-2 "
	bind:this={dialog}
	onclose={() => (showModal = false)}
>
{#if showcls}
		<svg class="cursor-pointer absolute size-[24px] stroke-white fill-red-500 top-[-1px] right-0 z-10" 
			onclick={()=>dialog.close()} viewBox="0 0 12 12">
			<circle cx="6" cy="6" r="6" />
			<line x1="3" y1="3" x2="9" y2="9" />
			<line x1="9" y1="3" x2="3" y2="9" />
		</svg>
{/if}
	<div bind:this={pdiv} class="h-[92dvh]">
		{@render children?.()}
	</div>

<!-- 	<div class="min-h-8">
		{#if showcls}
			<button class="my-2" onclick={() => dialog.close()}>Close</button>
		{/if}
	</div> -->
</dialog>

<style>
	dialog::backdrop {
		background: rgba(0, 0, 0, 0.3);
		pointer-events: none;
	}
</style>
