<script>
	export let file_path = "";

	const NodeID3 = require("node-id3")

	const { dialog } = require('electron').remote

	import Text from "../components/text.svelte";
	import Cover from "../components/cover.svelte";
	//import Button from "../components/button.svelte";

	let tags = NodeID3.read(file_path);

	let title = tags.title;
	let artist = tags.artist;
	let album = tags.album;
	let year = tags.year;
	let image = tags.image != undefined ? tags.image.imageBuffer : undefined;
	let image_mime = tags.image != undefined ? tags.image.mime : undefined;

	console.log(tags)

	function saveTag() {
		let new_tags = {
			title: title,
			artist: artist,
			album: album,
			year: "" + year,
			image: {
				mime: image_mime,
				type: {
					id: 3,
					name: "front cover"
				},
				description: "Cover",
				imageBuffer: image
			}
		}

		let success = NodeID3.update(new_tags, file_path)

		if (success) {
			dialog.showMessageBox(undefined, {
				type: "info",
				title: "Tags sauvegardés!",
				message: "Tous les tags ont été sauvegardés dans votre fichier!"
			})
		}
	}
</script>

<style>
	
</style>

<Text placeholder="Titre" bind:value="{title}" name="title" />
<Text placeholder="Artiste" bind:value="{artist}" name="artist" />
<Text placeholder="Album" bind:value="{album}" name="album" />
<Text placeholder="Année" bind:value="{year}" name="year" type="number" />
<Cover bind:image={image} bind:image_mime={image_mime} />

<button on:click={saveTag}>Sauvegarder</button>