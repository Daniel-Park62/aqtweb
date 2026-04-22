<script>
	let { showModal = $bindable(), showcls=true,wd,hd, children } = $props();
	let dialog; // reference to the dialog element
	let pdiv; // reference to the content div
	// Use $effect to respond to state changes and call native dialog methods
	$effect(() => {
		if (dialog && wd) {
			dialog.style.width = wd;
		}
		if (dialog && hd) {
			dialog.style.height = hd;
			pdiv.style.height = dialog.offsetHeight * 0.90 + "px";
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
<dialog class="max-w-[96%]  max-h-dvh border-none rounded-lg p-0 resize "
	bind:this={dialog}
	onclose={() => (showModal = false)}
	// onclick={(e) => { if (e.target === dialog) dialog.close(); }}
>
	<div bind:this={pdiv} class="h-[92dvh]">
		{@render children?.()}
	</div>
		{#if showcls}
		<button onclick={() => dialog.close()}>Close</button>
		{/if}
</dialog>

<style>
	dialog::backdrop { background: rgba(0, 0, 0, 0.3); pointer-events: none;}
</style>