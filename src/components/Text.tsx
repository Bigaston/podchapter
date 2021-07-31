import React from "react";

import style from "./Text.module.css";

interface Props {
  type?: "text" | "number";
  placeholder?: string;
  name: string;
  value?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
}

export function Text({
  type = "text",
  placeholder,
  name,
  value,
  onChange,
}: Props) {
  return (
    <div className={style.floatingLabel}>
      <input
        className={style.floatingInput}
        type={type}
        placeholder={placeholder}
        name={name}
        value={value}
        onChange={onChange}
      />
      <label htmlFor={name}>{placeholder}</label>
    </div>
  );
}
