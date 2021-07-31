import React from "react";

import Button from "../components/Button";

import { InlineIcon } from "@iconify/react";
import openFileIcon from "@iconify/icons-twemoji/open-file-folder";

const ipcRenderer = window.require("electron").ipcRenderer;

interface Props {
  onFileChosed: (file: string) => void;
}

export default function FileChooser({ onFileChosed }: Props) {
  function handleButtonClick(e: any) {
    ipcRenderer.invoke("openFileDialog").then((result?: string[]) => {
      if (result === undefined) {
        return;
      }

      onFileChosed(result[0]);
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
