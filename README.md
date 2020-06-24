# PodChapter
PodChapter est un petit outil codé à partir de Electron et permetant d'éditer les métadonnés de vos fichier .mp3, ainsi que d'ajouter des chapitres dans ces fichiers

![Choix du fichier](./img/1.png) ![Edition des métadonnés](./img/2.png) ![Ajout d'une cover ou de chapitres](./img/3.png)

**Pourquoi avoir recommencé le développement de zero?**  
Pour pouvoir s'affranchir de FFMPEG! Dans la première version PodChapter utilisait FFMPEG pour mettre les chapitres dans le fichier MP3, mais cela nécessitait de l'installer à la main. De plus les accents étaient mal supportés. Mais depuis, un module Node appelé [node-id3](npmjs.org/package/node-id3) est sortit et nous permet de faire le travail depuis NodeJS, et de manière plus propre.  
L'application est codée en Electron ce qui la rend un peu plus lourde et plus lente à démarrer mais cela nous donne aussi une certaine facilitée de développement.

## Téléchargement
Rendez vous dans la partie Release (ou [cliquez ici](https://github.com/Bigaston/podchapter/releases/latest)) et téléchargez l'archive .zip contenant l'application pour Windows

Décompressez cette archive, et lancez le fichier .exe . L'application s'installera automatiquement!

L'application est techniquement compatible avec Linux et OSX mais nous ne l'avons pas encore compilé pour ces plateformes.

## Crédits
Développé par [Bigaston](https://twitter.com/Bigaston) avec l'aide de [PofMagicfingers](https://twitter.com/PofMagicfingers/)  
Une partie des composants ont été fait par [Phil_Goud](https://twitter.com/Phil_Goud)

💸 [Me soutenir](https://utip.io/bigaston)
