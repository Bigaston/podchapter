<script>
	import FileSelect from "./pages/file_select.svelte"
	import ChapterEditor from "./pages/chapter_editor.svelte"

    import IconifyIcon from "@iconify/svelte";
    import keyboardIcon from "@iconify/icons-twemoji/keyboard";
    import moneyBagIcon from "@iconify/icons-twemoji/money-bag";

	const { shell } = require('electron')

	let file_chosed = false;

	let file_path = "";

	function fileChosed(e) {
		file_path = e.detail;
		file_chosed = true;
	}

	function openLink(e) {
		e.preventDefault();

		shell.openExternal(e.target.attributes.href.nodeValue)
	}
</script>

<style>
	h1 {
		text-align: center;
	}

	.wrapper {
		padding: 10px;
	}

	.footer {
        font-size: 14px;
        color: #6c757d;
        text-align: center;
        margin-bottom: 2rem;
        padding-top: 2rem;
	}
	
	.footer a {
        color: #6c757d;
	}
</style>

<div class="wrapper">
	<h1>PodChapter</h1>
	{#if !file_chosed}
		<FileSelect on:file={fileChosed} />
	{:else}
		<ChapterEditor {file_path} on:back={() => {file_path = undefined; file_chosed = false}}/>
	{/if}
</div>

<div class="footer">
	<p>PodChapter est développé par <a href="https://twitter.com/Bigaston" on:click={openLink}>Bigaston</a> avec l'aide de <a href="https://twitter.com/PofMagicfingers" on:click={openLink}>PofMagicfingers</a></p>
	<p><IconifyIcon icon={keyboardIcon} inline={true} /> <a href="https://github.com/Bigaston/podchapter" on:click={openLink}>Code Source</a> | <IconifyIcon icon={moneyBagIcon} inline={true} /> <a href="https://utip.io/bigaston" on:click={openLink}>Me soutenir</a></p>
</div>
