<script>
	export let image;
	export let image_mime;
	export let size = "250px";

	const nativeImage = require('electron').nativeImage
	const { dialog } = require('electron').remote

	let img_url;
	if (image != undefined) {
		img_url = nativeImage.createFromBuffer(image).toDataURL()
	} else {
		img_url = nativeImage.createEmpty().toDataURL()
	}

	function editCover() {
		let new_image_path = dialog.showOpenDialogSync(undefined, {filters: [
			{name: "Image", extensions: ["png", "jpg"]}
		]})

		if (new_image_path != undefined) {
			let native = nativeImage.createFromPath(new_image_path[0])
			image = Buffer.from(native.toJPEG(100))
			image_mime = "jpeg"
			img_url = native.toDataURL()
		}
	}
</script>

<style>
	#editable {
		padding: 0px;
		border-radius: 4px;
		border: solid black 1px;
		width: var(--size);
		height: var(--size);
	}

	#editable img {
		width: 100%;
		height: 100%;
		border-radius: 4px;
	}

	#editable:hover {
		cursor: pointer;
	}
</style>

<div id="editable" on:click={editCover} style="--size: {size};">
	<img src="{img_url}" alt="Cover" />
</div>