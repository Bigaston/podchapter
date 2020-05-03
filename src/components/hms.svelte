<script>
	import {onMount} from "svelte";

    export let placeholder = "";
	export let ms = 0;
	export let name;

    let value = "00:00:00";

	let input_error = false;

	const handleInput = e => {
		if (value.match(/[0-9][0-9]:[0-9][0-9]:[0-9][0-9]/) == null) {
			input_error = true;
		} else {
			input_error = false;
			ms = fromHMS(value);
		}
  	};

	onMount(() => {
		value = toHMS(ms)
	})

	function fromHMS(str) {
		let tab = str.split(":")

		let nb_ms = ((parseInt(tab[0]) * 3600) + (parseInt(tab[1]) * 60) + (parseInt(tab[2]))) * 1000

		return nb_ms >= 1 ? nb_ms : 1
	}

	function toHMS(pMs) {
		let nbSec = Math.round(pMs / 1000);
		let sortie = {};
		sortie.heure = Math.trunc(nbSec/3600);
		if (sortie.heure < 10) {sortie.heure = "0"+sortie.heure}
	
		nbSec = nbSec%3600;
		sortie.minute = Math.trunc(nbSec/60);
		if (sortie.minute < 10) {sortie.minute = "0"+sortie.minute}
	
		nbSec = nbSec%60;
		sortie.seconde = Math.trunc(nbSec);
		if (sortie.seconde < 10) {sortie.seconde = "0"+sortie.seconde}

		let sortie_chaine = sortie.heure + ":" + sortie.minute + ":" + sortie.seconde
		return sortie_chaine
	}
</script>

<style>
    label {
        font-size: 12.5px;
        color: #000;
        opacity: 1;
        font-weight: 400;
    }
    
    .floating-input {
        font-family: Roboto,sans-serif;
        font-size: 75%;
        padding: 20px 0px;
        height: 56px;
        border: none;
        border-bottom: solid 1px rgba(0, 0, 0, 0.1);
        background: #fff;
        width: 100%;
        box-sizing: border-box;
        color: #000;
        font-weight: 400;
        -webkit-appearance: none;
    }
    .floating-input:focus {
        border-bottom: solid 1px black;
        outline: 0;
        box-shadow: 0 2px 6px -8px rgba(0, 0, 0, 0.45);
    }
    .floating-label {
        position: relative;
        margin-bottom: 10px;
        width: 100%;
    }
    .floating-label label {
        position: absolute;
        top: calc(50% - 7px);
        left: 0;
        opacity: 0;
        z-index: -1;
    }    label {
        font-size: 12.5px;
        color: #000;
        opacity: 1;
        font-weight: 400;
    }
    
    .floating-input {
        font-family: Roboto,sans-serif;
        font-size: 75%;
        padding: 20px 0px;
        height: 56px;
        border: none;
        border-bottom: solid 1px rgba(0, 0, 0, 0.1);
        background: #fff;
        width: 100%;
        box-sizing: border-box;
        color: #000;
        font-weight: 400;
        -webkit-appearance: none;
    }

	.floating-input.error {
		color: #E74C3C;
	}

    .floating-input:focus {
        border-bottom: solid 1px black;
        outline: 0;
        box-shadow: 0 2px 6px -8px rgba(0, 0, 0, 0.45);
    }

    .floating-input.error:focus {
        border-bottom: solid 1px #E74C3C;
        outline: 0;
        box-shadow: 0 2px 6px -8px rgba(231, 76, 60, 0.45);
    }

    .floating-label {
        position: relative;
        margin-bottom: 10px;
        width: 100%;
    }
    .floating-label label {
        position: absolute;
        top: calc(50% - 7px);
        left: 0;
        opacity: 0;
        z-index: -1;
    }
    .floating-label input:not(:placeholder-shown) {
        padding: 28px 0px 12px 0px;
    }
    .floating-label input:not(:placeholder-shown) + label {
        transform: translateY(-15px);
        opacity: 0.7;
        z-index: 1;
    }
    
    .floating-label input:not(:placeholder-shown) + label {
        transform: translateY(-15px);
        opacity: 0.7;
        z-index: 1;
    }
</style>

<div class="floating-label">
    <input class="floating-input" class:error={input_error} type="text" {placeholder} {name} bind:value={value} on:input={handleInput}>
    <label for="{name}">{placeholder}</label>
</div>