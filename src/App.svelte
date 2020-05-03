<script>
	import FileSelect from "./pages/file_select.svelte"
	import ChapterEditor from "./pages/chapter_editor.svelte"

	let file_chosed = false;

	let file_path = "";

	function fileChosed(e) {
		file_path = e.detail;
		file_chosed = true;
	}
</script>

<style>
	h1 {
		text-align: center;
	}
</style>

<h1>PodChapter</h1>
{#if !file_chosed}
	<FileSelect on:file={fileChosed} />
{:else}
	<ChapterEditor {file_path}/>
{/if}