<script>
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();

	export let text = "";
	export let enabled = true;

	function click() {
		if (enabled) {
			dispatch("click");
		}
	}
</script>

<style>
	
</style>

<div class="container">
	<div on:click={click} class="button" id="btnIndex">
	 	<div class="buttonlabel">
			{ text }
		</div>
	</div>
</div>