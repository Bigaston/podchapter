const shell = window.require("electron").shell;

export function openLink(e: any) {
  e.preventDefault();

  shell.openExternal(e.target.attributes.href.nodeValue);
}
