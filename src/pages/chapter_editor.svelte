<script>
	import { createEventDispatcher } from "svelte";
	import Text from "../components/text.svelte";
	import Cover from "../components/cover.svelte";
	import HMS from "../components/hms.svelte";
	import Button from "../components/button.svelte";

	import IconifyIcon from "@iconify/svelte";
	import fileFolderIcon from "@iconify/icons-twemoji/file-folder";
	import bookmarkIcon from "@iconify/icons-twemoji/bookmark";
	import pencilIcon from "@iconify/icons-twemoji/pencil";
	import whiteFlagIcon from "@iconify/icons-twemoji/white-flag";
	import checkmarkIcon from "@iconify/icons-twemoji/check-mark-button";

	const NodeID3 = require("node-id3")

	const { dialog } = require('electron').remote

	const dispatch = createEventDispatcher()

	export let file_path = "";

	const tags = NodeID3.read(file_path);

	let title = tags.title;
	let artist = tags.artist;
	let album = tags.album;
	let year = tags.year;
	let composer = tags.composer;
	let genre = tags.genre;
	let trackNumber = tags.trackNumber;
	let performerInfo = tags.performerInfo
	let image = (tags.image || {}).imageBuffer;
	let image_mime = (tags.image || {}).mime;

	const chapter_list = tags.chapter || [];

	chapter_list.forEach((c, i) => {
		chapter_list[i].img = (c.tags || {}).image || {}
		chapter_list[i].tags = chapter_list[i].tags || {};
	})

	function addChapter() {
		const last_chapter = chapter_list[chapter_list.length - 1] || { endTimeMs: 0 }

		chapter_list.push(
			{
				elementID: Date.now().toString(),
				startTimeMs: last_chapter.endTimeMs,
				endTimeMs: last_chapter.endTimeMs + 30000,
				tags: {
					title: ""
				},
				img: {}
			}
		)

		chapter_list = chapter_list;
	}

	function saveTag() {
		const new_tags = {
			...tags,
			title,
			artist,
			album,
			year: year.toString(),
			composer,
			genre,
			trackNumber,
			performerInfo
		}

		if (image) {
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

		if (chapter_list.length > 0) {
			new_tags.chapter = chapter_list.map((c, i) => {
				if (c.img.imageBuffer !== undefined) {
					c.tags.image = {
						mime: c.img.mime,
						type: {
							id: 3,
							name: "front cover"
						},
						description: "Chapter artwork",
						imageBuffer: c.img.imageBuffer
					}
				}

				c.elementID = "chap" + i

				if (!!c.url) {
					c.tags.userDefinedUrl = [{
						description: "Chapter URL",
						url: c.url
					}]
				}

				return c;
			})

			new_tags.tableOfContents = [{
				elementID: "TOCM",
				isOrdered: true,
				elements: [],
				tags: {
					title: "Table of contents"
				}
			}]

			chapter_list.forEach((c, i) => {
				new_tags.tableOfContents[0].elements.push("chap" + i);
			})
		}

		const success = NodeID3.update(new_tags, file_path)

		if (success) {
			dialog.showMessageBox({
				type: "info",
				title: "Tags sauvegardés !",
				message: "Tous les tags ont été sauvegardés dans votre fichier !",
				buttons: ["OK"]
			})
		}
	}

	function backToFileSelect() {
		dispatch("back")
	}

	function up(e) {
		const pos = e.target.parentElement.attributes.index_chap.nodeValue;
		move(chapter_list, pos, pos - 1);
		chapter_list = chapter_list;
	}

	function deleteChap(e) {
		chapter_list.splice(e.target.parentElement.attributes.index_chap.nodeValue, 1);
		chapter_list = chapter_list;
	}

	function down(e) {
		const pos = e.target.parentElement.attributes.index_chap.nodeValue;
		move(chapter_list, pos, pos + 1)
		chapter_list = chapter_list;
	}

	function move(arr, old_index, new_index) {
		if (new_index < 0 || new_index >= arr.length) return;

		arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
		chapter_list = chapter_list;
	}
</script>

<style>
	.chapter_list {
		width: 100%;
		margin-bottom: 40px;
	}

	.chapter:not(:last-child) {
		border-bottom: solid 1px black;
	}

	.chapter {
		display: flex;
		flex-direction: row;
		margin-top: 10px
	}

	.chapter>div {
		display: flex;
		flex-direction: column;
	}

	.left {
		width: 100px;
	}

	.right {
		width: 100%;
		margin-left: 10px;
	}

	.triple {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
	}

	.triple input {
		margin: 5px;
	}

	h2 {
		text-align: center;
	}

	.icon {
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		margin-top: 5px;
	}

	.icon img {
		width: 25px;
		height: 25px;
	}

	.icon img:hover {
		cursor: pointer;
	}
</style>

<Button on:click={backToFileSelect}>
	<IconifyIcon icon={fileFolderIcon} inline={true} /> Changer de fichier
</Button>

<h2>
	<IconifyIcon icon={pencilIcon} inline={true} /> Informations
</h2>

<Text placeholder="Titre" bind:value="{title}" name="title" />
<Text placeholder="Interprète" bind:value="{artist}" name="artist" />
<Text placeholder="Album" bind:value="{album}" name="album" />
<div class="triple">
	<Text placeholder="Année" bind:value="{year}" name="year" type="number" />
	<Text placeholder="Numéro de piste" bind:value="{trackNumber}" name="trackNumber" type="number" />
	<Text placeholder="Genre" bind:value="{genre}" name="genre" />
</div>
<Text placeholder="Compositeur" bind:value="{composer}" name="composer" />
<Text placeholder="Artiste de l'album" bind:value="{performerInfo}" name="performerInfo" />

<Cover bind:image={image} bind:image_mime={image_mime} />

<h2>
	<IconifyIcon icon={bookmarkIcon} inline={true} /> Chapitres
</h2>

<div class="chapter_list">
	{#each chapter_list as chap, index (chap.elementID)}
	<div class="chapter">
		<div class="left">
			<Cover bind:image={chap.img.imageBuffer} bind:image_mime={chap.img.mime} size="100px" />
			<div class="icon" index_chap={index}>
				<img src="./img/up.svg" alt="Monter" on:click={up} />
				<img src="./img/trash.svg" alt="Supprimer" on:click={deleteChap} />
				<img src="./img/down.svg" alt="Descendre" on:click={down} />

			</div>
		</div>
		<div class="right">
			<Text placeholder="Titre du chapitre" name="title-{chap.elementID}" bind:value={chap.tags.title} />
			<HMS placeholder="Début" name="start-{chap.elementID}" bind:ms={chap.startTimeMs} />
			<HMS placeholder="Fin" name="end-{chap.elementID}" bind:ms={chap.endTimeMs} />
			<Text placeholder="Lien du chapitre" name="url-{chap.elementID}" bind:value={chap.url} />
		</div>
	</div>
	{/each}
</div>

<Button on:click={addChapter}>
	<IconifyIcon icon={whiteFlagIcon} inline={true} /> Ajouter un chapitre
</Button>
<Button on:click={saveTag}>
	<IconifyIcon icon={checkmarkIcon} inline={true} /> Sauvegarder
</Button>
