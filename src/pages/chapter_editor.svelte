<script>
	export let file_path = "";

	const NodeID3 = require("node-id3")

	const { dialog } = require('electron').remote

	import Text from "../components/text.svelte";
	import Cover from "../components/cover.svelte";
	import HMS from "../components/hms.svelte";
	//import Button from "../components/button.svelte";

	let tags = NodeID3.read(file_path);

	let title = tags.title;
	let artist = tags.artist;
	let album = tags.album;
	let year = tags.year;
	let image = tags.image != undefined ? tags.image.imageBuffer : undefined;
	let image_mime = tags.image != undefined ? tags.image.mime : undefined;

	let chapter_list = tags.chapter || [];

	chapter_list.forEach((c, i) => {
		if (c.tags.image != undefined) {
			chapter_list[i].img = {
				imageBuffer: c.tags.image.imageBuffer,
				mime: c.tags.image.mime
			}
		} else {
			chapter_list[i].img = {
				imageBuffer: undefined,
				mime: undefined
			}
		}

		if (chapter_list[i].tags == undefined) {
			chapter_list[i].tags = {};
		}
	})

	console.log(tags)

	function addChapter() {
		let new_chapter = {
			elementID: "" + Date.now(),
			startTimeMs: 0,
			endTimeMs: 1000,
			tags: {
				title: ""
			},
			img: {
				imageBuffer: undefined,
				mime: undefined
			}
		}

		chapter_list.push(new_chapter)
		chapter_list = chapter_list;
	}

	function saveTag() {
		let new_tags = {
			title: title,
			artist: artist,
			album: album,
			year: "" + year
		}

		if (image != undefined) {
			new_tags.image = {
				mime: image_mime,
				type: {
					id: 3,
					name: "front cover"
				},
				description: "Cover",
				imageBuffer: image
			}
		}

		if (chapter_list.length != 0) {
			chapter_list.forEach((c, i) => {
				if (c.img.imageBuffer != undefined) {
					c.tags.image = {
						mime: c.img.mime,
						type: {
							id: 3,
							name: "front cover"
						},
						description: "Cover chapter " + i,
						imageBuffer: c.img.imageBuffer
					}
				}

				c.elementID = "chap" + i

				chapter_list[i] = c;
			})

			new_tags.chapter = chapter_list;

			console.log(new_tags)

			let success = NodeID3.write(new_tags, file_path)

			if (success) {
				dialog.showMessageBox(undefined, {
					type: "info",
					title: "Tags sauvegardés!",
					message: "Tous les tags ont été sauvegardés dans votre fichier!"
				})
			}
		} else {
			let success = NodeID3.write(new_tags, file_path)

			if (success) {
				dialog.showMessageBox(undefined, {
					type: "info",
					title: "Tags sauvegardés!",
					message: "Tous les tags ont été sauvegardés dans votre fichier!"
				})
			}
		}
	}

	function parseImg(img, normalImg) {
		return img != undefined ? normalImg : undefined;
	}
</script>

<style>
	.chapter_list {
		width: 100%;
		max-height: 500px;
		overflow-y: scroll;
	}

	.chapter:not(:last-child) {
		border-bottom: solid 1px black;
	}

	.chapter {
		display: flex;
		flex-direction: row;
		margin-top: 10px
	}

	.chapter > div {
		display: flex;
		flex-direction: column;
		width: 100%;
		margin-left: 10px;
	}
</style>

<Text placeholder="Titre" bind:value="{title}" name="title" />
<Text placeholder="Artiste" bind:value="{artist}" name="artist" />
<Text placeholder="Album" bind:value="{album}" name="album" />
<Text placeholder="Année" bind:value="{year}" name="year" type="number" />
<Cover bind:image={image} bind:image_mime={image_mime} />

<h2>Les Chapitres</h2>

<div class="chapter_list">
	{#each chapter_list as chap (chap.elementID)}
		<div class="chapter">
			<Cover bind:image={chap.img.imageBuffer} bind:image_mime={chap.img.mime} size="100px" />
			<div>
				<Text placeholder="Titre du chapitre" name="title-{chap.elementID}" bind:value={chap.tags.title}/>
				<HMS placeholder="Début" name="start-{chap.elementID}" bind:ms={chap.startTimeMs} />
				<HMS placeholder="Fin" name="end-{chap.elementID}" bind:ms={chap.endTimeMs} />
			</div>
		</div>
	{/each}
</div>

<button on:click={addChapter}>Ajouter un chapitre</button>

<button on:click={saveTag}>Sauvegarder</button>