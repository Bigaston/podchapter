<script>
	import {createEventDispatcher, onMount} from "svelte";
	const { dialog } = require('electron').remote

	import Button from "../components/button.svelte"

	const dispatch = createEventDispatcher();

	let file_path;

	function openFileChoser() {
		file_path = dialog.showOpenDialogSync(undefined, {filters: [
			{name: "Fichier MP3", extensions: ["mp3"]}
		]})

		dispatch("file", file_path[0])
	}
</script>

<style>

</style>

<Button text="Selectionner un fichier" on:click={openFileChoser} />