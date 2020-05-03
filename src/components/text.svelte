<script>
    export let placeholder = "";
    export let value = "";
	export let name;
	export let type = "text"

	const handleInput = e => {
		value = type.match(/^(number|range)$/)
			? +e.target.value
			: e.target.value;
  	};
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
    <input class="floating-input" {type} {placeholder} {name} {value} on:input={handleInput}>
    <label for="{name}">{placeholder}</label>
</div>