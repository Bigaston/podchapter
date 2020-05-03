<script>
	import {createEventDispatcher} from "svelte";

	const dispatch = createEventDispatcher();

	let file_input;

	function fileUploaded() {
		dispatch("file", file_input.files[0].path)
	}
</script>

<style>

</style>

<input type="file" bind:this={file_input} accept="audio/mpeg" on:change={fileUploaded} />