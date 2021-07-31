import React, { useState } from "react";

// Components
import Footer from "./components/Footer";

// Pages
import FileChooser from "./pages/FileChooser";
import ChapterEditor from "./pages/ChapterEditor";

type PageName = "FileChooser" | "ChapterEditor";

function App() {
  const [page, setPage] = useState<PageName>("FileChooser");
  const [file, setFile] = useState<string | undefined>(undefined);

  function onFileChoosed(fileChoosed: string) {
    setFile(fileChoosed);
    setPage("ChapterEditor");
  }

  return (
    <>
      <h1 style={{ textAlign: "center" }}>PodChapter</h1>
      {page === "FileChooser" ? (
        <FileChooser onFileChosed={onFileChoosed} />
      ) : (
        <ChapterEditor file={file as string} />
      )}

      <Footer />
    </>
  );
}

export default App;
