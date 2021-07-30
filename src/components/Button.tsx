import React from "react";

import classes from "./Button.module.css";

export default function Button({
  onClick,
  style,
  children,
}: {
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <button style={style} className={classes.button} onClick={onClick}>
      {children}
    </button>
  );
}
