import React, { useEffect, useState } from "react";

import { Tag } from "../utils/_type";

import { Text } from "../components/Text";

import style from "./ChapterEditor.module.css";

const NodeID3 = window.require("node-id3");

interface Props {
  file: string;
}

export default function ChapterEditor({ file }: Props) {
  const [tags, setTags] = useState<Tag>({});

  useEffect(() => {
    setTags(NodeID3.read(file));
  }, [file]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTags((before) => ({
      ...before,
      [e.target.getAttribute("name") || ""]: e.target.value,
    }));
  }

  return (
    <div className={style.container}>
      <Text
        placeholder="Titre"
        value={tags.title || ""}
        onChange={handleChange}
        name="title"
      />
      <Text
        placeholder="Interprète"
        value={tags.artist || ""}
        onChange={handleChange}
        name="artist"
      />

      <Text
        placeholder="Album"
        value={tags.album || ""}
        onChange={handleChange}
        name="album"
      />

      <div className={style.multipleInput}>
        <Text
          placeholder="Année"
          value={tags.year || ""}
          type="number"
          onChange={handleChange}
          name="year"
        />

        <Text
          placeholder="Numéro de piste"
          value={tags.trackNumber || ""}
          type="number"
          onChange={handleChange}
          name="trackNumber"
        />

        <Text
          placeholder="Genre"
          value={tags.genre || ""}
          onChange={handleChange}
          name="genre"
        />
      </div>

      <Text
        placeholder="Compositeur"
        value={tags.composer || ""}
        onChange={handleChange}
        name="composer"
      />
    </div>
  );
}
