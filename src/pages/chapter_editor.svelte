<script>
  import { createEventDispatcher } from "svelte";
  import Text from "../components/text.svelte";
  import Cover from "../components/cover.svelte";
  import HMS from "../components/hms.svelte";
  import Button from "../components/button.svelte";

  import IconifyIcon from "@iconify/svelte";
  import fileFolderIcon from "@iconify/icons-twemoji/file-folder";
  import bookmarkIcon from "@iconify/icons-twemoji/bookmark";
  import pencilIcon from "@iconify/icons-twemoji/pencil";
  import whiteFlagIcon from "@iconify/icons-twemoji/white-flag";
  import checkmarkIcon from "@iconify/icons-twemoji/check-mark-button";
  import openBookIcon from "@iconify/icons-twemoji/open-book";
  const fs = require("fs");

  const storage = require("electron-json-storage");

  const NodeID3 = require("node-id3");

  const { dialog, Menu, MenuItem } = require("electron").remote;
  const { shell } = require("electron");

  const dispatch = createEventDispatcher();

  export let file_path = "";

  const tags = NodeID3.read(file_path);

  console.log("loaded tags:", tags);

  let title = tags.title;
  let artist = tags.artist;
  let album = tags.album;
  let year = tags.year;
  let composer = tags.composer;
  let genre = tags.genre;
  let trackNumber = tags.trackNumber;
  let performerInfo = tags.performerInfo;

  tags.image = tags.image || {};

  // We need the raw image mime type
  tags.image.mime =
    (tags.raw && tags.raw.APIC && tags.raw.APIC.mime) || "image/jpeg";

  if (
    typeof tags.image.mime === "string" &&
    !tags.image.mime.includes("image/")
  ) {
    tags.image.mime = "image/" + tags.image.mime;
  }

  let image = tags.image.imageBuffer;
  let image_mime = tags.image.mime;

  const seenChapterElementIds = {};

  // We reassign to trigger the update in svelte view cache
  let chapter_list = [tags.chapter]
    .flat()
    .filter((c) => !!c)
    .map((c) => {
      // Prevents duplicate chapter elementIDs
      while (seenChapterElementIds[c.elementID]) {
        const [_, prefix, number] = `${c.elementID}`.match(/(.*)([0-9]+)$/);
        c.elementID = prefix + (parseInt(number) + 1).toString();
      }

      // Mark chapter elementID as seen
      seenChapterElementIds[c.elementID] = true;

      // Add some default data
      c.img = (c.tags || {}).image || {};
      c.tags = c.tags || {};

      return c;
    });

  console.log(chapter_list);

  function addChapter() {
    const last_chapter = chapter_list[chapter_list.length - 1] || {
      endTimeMs: 0,
    };

    chapter_list.push({
      elementID: Date.now().toString(),
      startTimeMs: last_chapter.endTimeMs,
      endTimeMs: last_chapter.endTimeMs + 30000,
      tags: {
        title: "",
      },
      img: {},
    });

    chapter_list = chapter_list;
  }

  // Partie importation de chapitres
  let menuImport = new Menu();
  menuImport.append(
    new MenuItem({
      click: importAudacity,
      label: "Audacity",
    })
  );

  menuImport.append(
    new MenuItem({
      click: importReaper,
      label: "Reaper",
    })
  );

  function importAudacity() {
    if (storage.getSync("hideAudacityMessage") !== true) {
      dialog
        .showMessageBox({
          message: `Exportez votre piste de marqueur depuis "Fichier > Exporter > Exporter les marqueurs" puis selectionnez ce fichier à la prochaine fenêtre`,
          buttons: ["OK"],
          checkboxLabel: "Ne plus me montrer ce message",
        })
        .then((res) => {
          console.log(res);

          if (res.checkboxChecked) {
            storage.set("hideAudacityMessage", true, () => {
              openMarquerFile();
            });
          } else {
            openMarquerFile();
          }
        });
    } else {
      openMarquerFile();
    }

    function openMarquerFile() {
      let file_path = dialog.showOpenDialogSync(undefined, {
        filters: [{ name: "Piste de marqueur", extensions: ["txt"] }],
      });

      const content = fs.readFileSync(file_path[0], "utf-8");
      chapter_list = content
        .split("\n")
        .filter((r) => r !== "")
        .map((r, index) => {
          let c = r.split("\t");

          return {
            elementID: index,
            tags: { title: c[2] },
            startTimeMs: Math.trunc(parseFloat(c[0]) * 1000),
            endTimeMs: Math.trunc(parseFloat(c[1]) * 1000),
            img: {},
          };
        });
    }
  }
  function importReaper() {
    dialog
      .showMessageBox({
        message: `Vous pouvez importer vos chapitres directement depuis votre fichier MP3 si vous utilisez Reaper pour monter votre podcast`,
        buttons: ["Plus d'informations", "OK"],
      })
      .then((res) => {
        if (res.response === 0) {
          shell.openExternal(
            "https://podchapter.bigaston.dev/doc/importFromReaper"
          );
        }
      });
  }

  function importChapter() {
    menuImport.popup();
  }

  // Sauvegarde des tags
  function saveTag() {
    const new_tags = {
      ...tags,
      title,
      artist,
      album,
      year: year.toString(),
      composer,
      genre,
      trackNumber,
      performerInfo,
    };

    if (image !== new_tags.image.imageBuffer) {
      console.log("Updating image");
      new_tags.image = {
        mime: image_mime,
        type: {
          id: 3,
          name: "front cover",
        },
        description: "Cover",
        imageBuffer: image,
      };
    }

    if (chapter_list.length > 0) {
      new_tags.chapter = chapter_list.map((c, i) => {
        if (c.img.imageBuffer !== undefined) {
          c.tags.image = {
            mime: c.img.mime,
            type: {
              id: 3,
              name: "front cover",
            },
            description: "Chapter artwork",
            imageBuffer: c.img.imageBuffer,
          };
        }

        c.elementID = "chap" + i;

        if (!!c.url) {
          c.tags.userDefinedUrl = [
            {
              description: "Chapter URL",
              url: c.url,
            },
          ];
        }

        return c;
      });

      new_tags.tableOfContents = [
        {
          elementID: "TOCM",
          isOrdered: true,
          elements: [],
          tags: {
            title: "Table of contents",
          },
        },
      ];

      chapter_list.forEach((c, i) => {
        new_tags.tableOfContents[0].elements.push("chap" + i);
      });
    }

    console.log("Saving tags:", new_tags);

    const success = NodeID3.write(new_tags, file_path);

    if (success) {
      dialog.showMessageBox({
        type: "info",
        title: "Tags sauvegardés !",
        message: "Tous les tags ont été sauvegardés dans votre fichier !",
        buttons: ["OK"],
      });
    }
  }

  function backToFileSelect() {
    dispatch("back");
  }

  function up(e) {
    const pos = e.target.parentElement.attributes.index_chap.nodeValue;
    move(chapter_list, pos, pos - 1);
    chapter_list = chapter_list;
  }

  function deleteChap(e) {
    chapter_list.splice(
      e.target.parentElement.attributes.index_chap.nodeValue,
      1
    );
    chapter_list = chapter_list;
  }

  function down(e) {
    const pos = e.target.parentElement.attributes.index_chap.nodeValue;
    move(chapter_list, pos, pos + 1);
    chapter_list = chapter_list;
  }

  function move(arr, old_index, new_index) {
    if (new_index < 0 || new_index >= arr.length) return;

    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    chapter_list = chapter_list;
  }
</script>

<Button on:click={backToFileSelect}>
  <IconifyIcon icon={fileFolderIcon} inline={true} /> Changer de fichier
</Button>

<h2>
  <IconifyIcon icon={pencilIcon} inline={true} /> Informations
</h2>

<Text placeholder="Titre" bind:value={title} name="title" />
<Text placeholder="Interprète" bind:value={artist} name="artist" />
<Text placeholder="Album" bind:value={album} name="album" />
<div class="triple">
  <Text placeholder="Année" bind:value={year} name="year" type="number" />
  <Text
    placeholder="Numéro de piste"
    bind:value={trackNumber}
    name="trackNumber"
    type="number"
  />
  <Text placeholder="Genre" bind:value={genre} name="genre" />
</div>
<Text placeholder="Compositeur" bind:value={composer} name="composer" />
<Text
  placeholder="Artiste de l'album"
  bind:value={performerInfo}
  name="performerInfo"
/>

<Cover bind:image bind:image_mime />

<h2>
  <IconifyIcon icon={bookmarkIcon} inline={true} /> Chapitres
</h2>

<div class="chapter_list">
  {#each chapter_list as chap, index (chap.elementID)}
    <div class="chapter">
      <div class="left">
        <Cover
          bind:image={chap.img.imageBuffer}
          bind:image_mime={chap.img.mime}
          size="100px"
        />
        <div class="icon" index_chap={index}>
          <img src="./img/up.svg" alt="Monter" on:click={up} />
          <img src="./img/trash.svg" alt="Supprimer" on:click={deleteChap} />
          <img src="./img/down.svg" alt="Descendre" on:click={down} />
        </div>
      </div>
      <div class="right">
        <Text
          placeholder="Titre du chapitre"
          name="title-{chap.elementID}"
          bind:value={chap.tags.title}
        />
        <HMS
          placeholder="Début"
          name="start-{chap.elementID}"
          bind:ms={chap.startTimeMs}
        />
        <HMS
          placeholder="Fin"
          name="end-{chap.elementID}"
          bind:ms={chap.endTimeMs}
        />
        <Text
          placeholder="Lien du chapitre"
          name="url-{chap.elementID}"
          bind:value={chap.url}
        />
      </div>
    </div>
  {/each}
</div>

<Button on:click={addChapter}>
  <IconifyIcon icon={whiteFlagIcon} inline={true} /> Ajouter un chapitre
</Button>
<Button on:click={importChapter}>
  <IconifyIcon icon={openBookIcon} inline={true} /> Importer des chapitres
</Button>
<Button on:click={saveTag}>
  <IconifyIcon icon={checkmarkIcon} inline={true} /> Sauvegarder
</Button>

<style>
  .chapter_list {
    width: 100%;
    margin-bottom: 40px;
  }

  .chapter:not(:last-child) {
    border-bottom: solid 1px black;
  }

  .chapter {
    display: flex;
    flex-direction: row;
    margin-top: 10px;
  }

  .chapter > div {
    display: flex;
    flex-direction: column;
  }

  .left {
    width: 100px;
  }

  .right {
    width: 100%;
    margin-left: 10px;
  }

  .triple {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
  }

  .triple input {
    margin: 5px;
  }

  h2 {
    text-align: center;
  }

  .icon {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 5px;
  }

  .icon img {
    width: 25px;
    height: 25px;
  }

  .icon img:hover {
    cursor: pointer;
  }
</style>
