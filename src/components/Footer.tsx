import React from "react";

import style from "./Footer.module.css";

import { openLink } from "../utils/utils";

import { InlineIcon } from "@iconify/react";
import keyboardIcon from "@iconify/icons-twemoji/keyboard";
import moneyBagIcon from "@iconify/icons-twemoji/money-bag";

export default function Footer() {
  return (
    <div className={style.footer}>
      <p>
        PodChapter est développé par{" "}
        <a href="https://twitter.com/Bigaston" onClick={openLink}>
          Bigaston
        </a>{" "}
        avec l'aide de{" "}
        <a href="https://twitter.com/PofMagicfingers" onClick={openLink}>
          PofMagicfingers
        </a>
      </p>
      <p>
        <InlineIcon icon={keyboardIcon} />{" "}
        <a href="https://github.com/Bigaston/podchapter" onClick={openLink}>
          Code Source
        </a>{" "}
        | <InlineIcon icon={moneyBagIcon} />{" "}
        <a href="https://utip.io/bigaston" onClick={openLink}>
          Me soutenir
        </a>
      </p>
    </div>
  );
}
