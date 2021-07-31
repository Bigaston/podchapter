import React from "react";

import Button from "../components/Button";

import { InlineIcon } from "@iconify/react";
import openFileIcon from "@iconify/icons-twemoji/open-file-folder";

const ipcRenderer = window.require("electron").ipcRenderer;

export default function FileChooser() {
  function handleButtonClick(e: any) {
    ipcRenderer.invoke("openFileDialog").then((result: string) => {
      console.log(result);
    });
  }

  return (
    <>
      <Button onClick={handleButtonClick}>
        <InlineIcon icon={openFileIcon} /> Sélectionner un fichier
      </Button>
    </>
  );
}
