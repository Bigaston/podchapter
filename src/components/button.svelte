<script>
	import { createEventDispatcher } from "svelte";

	const dispatch = createEventDispatcher();

	export let text = "";

	function click() {
		dispatch("click");
	}
</script>

<style>
	.container {
		width: 100%;
		margin-bottom: 2rem;
		margin-left: auto;
		margin-right: auto;
		display: flex;
		flex-direction: row;
		justify-content: center;
		text-align: center;
	}

	.button{
		background-position: center;
		background-color: #3052b3;
		border-radius: 7px;
		text-decoration: none;
		border: none;
		width: 90%;
		max-width: 800px;
		margin-right: auto;
		margin-left: auto;
		display: flex;
		flex-direction: row;
		filter: drop-shadow(0px 0px 3px #888);
		cursor: pointer;
		font-size: inherit;

	}
	.button:active {
		background-color: #3052b3;
		filter: drop-shadow(0 0px 0px rgba(0, 0, 0, 0.5) );
	}


	button:focus {
		outline: none;
	}

	.button:hover {
		background-color: #4463ba;
		filter: drop-shadow(0 3px 3px rgba(0, 0, 0, 0.5) );
	}

	.buttonlabel{
		color: white;
		flex-grow: 1;
		align-self: center;
		padding-top: 5px;
		padding-bottom: 5px;
	}
</style>

<div class="container">
	<div on:click={click} class="button" id="btnIndex">
	 	<div class="buttonlabel">
            <slot>{ text }</slot>
        </div>
	</div>
</div>
