const path = require("path");
const fs = require("fs");
const pkg = require("../package.json");

const template = `
### Windows

- [Installer](https://github.com/Bigaston/podchapter/releases/download/latest/PodChapter-Setup-${pkg.version}.exe)
- [Web Installer](https://github.com/Bigaston/podchapter/releases/download/latest/PodChapter-Web-Setup-${pkg.version}.exe)
- [Portable](https://github.com/Bigaston/podchapter/releases/download/latest/PodChapter-${pkg.version}.exe)

### Mac

- [DMG](https://github.com/Bigaston/podchapter/releases/download/latest/PodChapter-${pkg.version}.dmg)

### Linux

- [AppImage](https://github.com/Bigaston/podchapter/releases/download/latest/PodChapter-${pkg.version}.AppImage)
- [snap](https://github.com/Bigaston/podchapter/releases/download/latest/podchapter-${pkg.version}.snap)
- [deb (Ubuntu, Debian, etc)](https://github.com/Bigaston/podchapter/releases/download/latest/podchapter-${pkg.version}.deb)
- [rpm (Fedora, etc)](https://github.com/Bigaston/podchapter/releases/download/latest/podchapter-${pkg.version}.x86_64.deb)
- [pacman (Archlinux, Manjaro, etc)](https://github.com/Bigaston/podchapter/releases/download/latest/podchapter-${pkg.version}.pacman)
`;

const README = path.resolve(__dirname, "../README.md");

fs.readFile(README, "utf8", function (err, content) {
  if (err) throw err;

  new_content = content.replace(
    new RegExp("<!--RELEASE_LINKS_START-->.*<!--RELEASE_LINKS_END-->", "s"),
    `<!--RELEASE_LINKS_START-->\n${template}\n<!--RELEASE_LINKS_END-->`
  );

  if (new_content !== content) {
    fs.writeFile(README, new_content, "utf8", function (err) {
      if (err) throw err;
      console.log("> README download links updated!");
    });
  } else {
    console.log("> README download links update is not needed.");
  }
});
