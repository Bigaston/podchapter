<script>
  import FileSelect from "./pages/file_select.svelte";
  import ChapterEditor from "./pages/chapter_editor.svelte";

  const { dialog } = require("electron").remote;

  import IconifyIcon from "@iconify/svelte";
  import keyboardIcon from "@iconify/icons-twemoji/keyboard";
  import moneyBagIcon from "@iconify/icons-twemoji/money-bag";

  import { onMount } from "svelte";

  const { shell } = require("electron");

  let file_chosed = false;

  let file_path = "";

  function fileChosed(e) {
    file_path = e.detail;
    file_chosed = true;
  }

  function openLink(e) {
    e.preventDefault();

    shell.openExternal(e.target.attributes.href.nodeValue);
  }

  onMount(() => {
    console.log(process.env.BUILD_ENV);

    if (process.env.BUILD_ENV !== "pro") {
      document.title = "PodChapter Free";

      dialog
        .showMessageBox({
          message:
            "PodChapter est un outil gratuit mais vous pouvez l'acheter et soutenir le développement sur Itch.io!",
          buttons: ["Acheter sur Itch.io", "OK"],
          cancelId: 1,
        })
        .then((res) => {
          if (res.response === 0) {
            shell.openExternal("https://bigaston.itch.io/podchapter");
          }
        });
    } else {
      document.title = "PodChapter Pro";
    }

    fetch("https://api.github.com/repos/Bigaston/podchapter/releases/latest")
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
      })
      .then((data) => {
        if (
          !data.draft &&
          compareVersion(process.env.npm_package_version, data.name) === -1
        ) {
          dialog
            .showMessageBox({
              type: "info",
              title: `Une nouvelle version est disponible! (v${data.name})`,
              message: `Une nouvelle version de PodChapter est disponible! (v${data.name})`,
              buttons: [
                "Télécharger sur Github",
                "Télécharger sur Itch.io",
                "OK",
              ],
              detail: `Nouveautés:\n${data.body}`,
              cancelId: 2,
            })
            .then((res) => {
              if (res.response === 0) {
                shell.openExternal(data.html_url);
              } else if (res.response === 1) {
                shell.openExternal("https://bigaston.itch.io/podchapter");
              }
            });
        }
      });
  });

  function compareVersion(v1, v2) {
    if (typeof v1 !== "string") return false;
    if (typeof v2 !== "string") return false;
    v1 = v1.split(".");
    v2 = v2.split(".");
    const k = Math.min(v1.length, v2.length);
    for (let i = 0; i < k; ++i) {
      v1[i] = parseInt(v1[i], 10);
      v2[i] = parseInt(v2[i], 10);
      if (v1[i] > v2[i]) return 1;
      if (v1[i] < v2[i]) return -1;
    }
    return v1.length == v2.length ? 0 : v1.length < v2.length ? -1 : 1;
  }
</script>

<div class="wrapper">
  <h1>PodChapter</h1>
  {#if !file_chosed}
    <FileSelect on:file={fileChosed} />
  {:else}
    <ChapterEditor
      {file_path}
      on:back={() => {
        file_path = undefined;
        file_chosed = false;
      }}
    />
  {/if}
</div>

<div class="footer">
  <p>
    PodChapter est développé par <a
      href="https://twitter.com/Bigaston"
      on:click={openLink}>Bigaston</a
    >
    avec l'aide de
    <a href="https://twitter.com/PofMagicfingers" on:click={openLink}
      >PofMagicfingers</a
    >
  </p>
  <p>
    <IconifyIcon icon={keyboardIcon} inline={true} />
    <a href="https://github.com/Bigaston/podchapter" on:click={openLink}
      >Code Source</a
    >
    | <IconifyIcon icon={moneyBagIcon} inline={true} />
    <a href="https://patreon.com/bigaston" on:click={openLink}>Me soutenir</a>
  </p>
</div>

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
