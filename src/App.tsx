import React, { useState } from "react";

// Components
import Footer from "./components/Footer";

// Pages
import FileChooser from "./pages/FileChooser";

type PageName = "FileChooser" | "ChapterEditor";

function App() {
  const [page, setPage] = useState<PageName>("FileChooser");

  return (
    <>
      <h1 style={{ textAlign: "center" }}>PodChapter</h1>
      {page === "FileChooser" ? <FileChooser /> : null}

      <Footer />
    </>
  );
}

export default App;
