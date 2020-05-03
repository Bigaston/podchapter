<script>
	import {createEventDispatcher, onMount} from "svelte";
	const { dialog } = require('electron').remote

	const dispatch = createEventDispatcher();

	let file_path;
	let drop_zone;

	function fileUploaded() {
		dispatch("file", file_path)
	}

	function openFileChoser() {
		file_path = dialog.showOpenDialogSync(undefined, {filters: [
			{name: "Fichier MP3", extensions: ["mp3"]}
		]})
	}

	function onDrop(e) {
		console.log(e)
	}
</script>

<style>
	#drop_zone {
		width: 100%;
		height: 300px;
		border-radius: 10px;
		background-color: #E5E8E8;
		box-shadow: 2px 2px 5px #BFC9CA;
		display: flex;
		justify-content: center;
		align-items: center;
		text-align: center;
	}

	#drop_zone:hover {
		cursor: pointer;
	}

	#drop_zone p {
		color: #5F6A6A;
	}
</style>

<div id="drop_zone" on:click={openFileChoser} on:drop={onDrop}>
	<p>Déposez un fichier .mp3 ici<br>
		(Ou cliquez pour ouvrir un selectionneur de fichier)</p>
</div>