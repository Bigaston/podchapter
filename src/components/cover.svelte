<script>
	export let image;
	export let image_mime;
	export let size = "250px";

	const nativeImage = require('electron').nativeImage
	const { dialog, Menu, MenuItem } = require('electron').remote

	const default_image = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAyAAAAMgAgMAAACmHu77AAAADFBMVEXf39+zs7PExMTU1NSQ2M1BAAACzklEQVR42uzBgQAAAACAoP2pF6kCAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAGB27tgmdiCKwvDg1Qv2SUvmEjZ4BThwtiW8gDusBMEWQEAJ28T0QQluwiUQ0AXyvezaCGFC5hydL0Mk/MHIc8eDRURERERERERERERERERERNb0tiIPCUaxNaeEorFVx4Ria6tyQtHZOphFsrd15wSitXWHBEIhtVFIbRRSG4XUhirk8N3vFPIzhSgkgVBIbfhC3vILRUhvlgeGkGJmJ4KQnZ/GEYR0NhnwQ0abHPBDzJ3gQxpzR/iQnbk7+JCtuQwf8scCfEhnYUAP2Vs4K+TXxR/bWjgo5NcppDZki50mhOaBSLNFodk07szdw4d8Gqz6PMCGpLIYdYs94Ia08/OwmYpgQ+bjIF/4+Ywa0sxLZB+XGUFDFkemo02eUEO2l6fIxsILaMj1tcKNhTyAhny5rfkAHtLZxRN2yGhXBTqE5S5KwxKyYwnpWEJalpBCEuIblFzwQ3yt393ih/gG5TH18CE+jDyn9IoeMn6cN24Kdsjmekz3FzukmU+3/kGHfKz1yaYgh3SLixy3yCGtLX7sgUPKp3cLI2yIr/WMfIjtLvfoCEL8fc9/gpDYoBCEFN+g4IfEMAL9xirc+DBCEBIbFIIQX+sngpAYRghCbIL9enoxjBCE+Fo/EoTEMEIQEsMIQUgMI/ghMYyAX6qZhxGCkBhGCEJiGIEOofnHfIXURCG1UUhtFFIbmhCaj+nRfN6Q5oOTNJ8Apfko6zs7dyADAAAAMMjf+h5fgfRpcgEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAqD04EAAAAAAQ5G89yBUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACwH2Lva8nFuuAAAAAABJRU5ErkJggg==";

	let img_url = image && nativeImage.createFromBuffer(image).toDataURL() || default_image;
	

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

	function deleteImage() {
		image = Buffer.from(nativeImage.createEmpty().toJPEG(100))
		image_mime = "none";
		img_url = default_image
	}

	// Menu de suppression de l'image
	let item_modif = new MenuItem({
		click: editCover,
		label: "Modifier"
	})

	let item_suppr = new MenuItem({
		click: deleteImage,
		label: "Supprimer"
	})

	let menu = new Menu()
	menu.append(item_modif)
	menu.append(item_suppr);

	function coverClicked() {
		menu.popup()
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

<div id="editable" on:click={coverClicked} style="--size: {size};">
	<img src="{img_url}" alt="Cover" />
</div>
