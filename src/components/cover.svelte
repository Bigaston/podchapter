<script>
	export let image;
	export let image_mime;

	const nativeImage = require('electron').nativeImage
	const { dialog } = require('electron').remote

	let img_url;
	if (image != undefined) {
		img_url = nativeImage.createFromBuffer(image).toDataURL()
	} else {
		img_url = nativeImage.createEmpty().toDataURL()
	}

	console.log(img_url)

	function editCover() {
		let new_image_path = dialog.showOpenDialogSync(undefined, {filters: [
			{name: "Image", extensions: ["png", "jpg"]}
		]})

		if (new_image_path != undefined) {
			let native = nativeImage.createFromPath(new_image_path[0])
			image = native.toJPEG(100)
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
		width: 250px;
		height: 250px;
	}

	#editable img {
		width: 100%;
		height: 100%;
	}

	#editable:hover {
		cursor: pointer;
	}
</style>

<div id="editable" on:click={editCover}>
	<img src="{img_url}" alt="Cover" />
</div>