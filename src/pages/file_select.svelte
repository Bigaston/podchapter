<script>
  import { createEventDispatcher, onMount } from "svelte";
  const { dialog } = require("electron").remote;

  import Button from "../components/button.svelte";

  import IconifyIcon from "@iconify/svelte";
  import openFileIcon from "@iconify/icons-twemoji/open-file-folder";

  const dispatch = createEventDispatcher();

  let file_path;

  function openFileChoser() {
    file_path = dialog.showOpenDialogSync(undefined, {
      filters: [{ name: "Fichier MP3", extensions: ["mp3"] }],
    });

    dispatch("file", file_path[0]);
  }
</script>

<Button on:click={openFileChoser}>
  <IconifyIcon icon={openFileIcon} inline={true} />
  Sélectionner un fichier
</Button>
