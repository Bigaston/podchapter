import React from "react";

import Button from "../components/Button";

import { InlineIcon } from "@iconify/react";
import openFileIcon from "@iconify/icons-twemoji/open-file-folder";

export default function FileChooser() {
  function handleButtonClick(e: any) {
    console.log(e);
  }

  return (
    <>
      <Button onClick={handleButtonClick}>
        <InlineIcon icon={openFileIcon} /> Sélectionner un fichier
      </Button>
    </>
  );
}
