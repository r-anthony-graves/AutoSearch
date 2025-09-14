import React from "react";
import { createRoot } from "react-dom/client";
import { SearchBar } from "./components/SearchBar";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div style={{ padding: 24 }}>
      <h3>Autosuggest</h3>
      {/* Web search */}
      <SearchBar hl="en" gl="us" ds="" onSelect={(s) => console.log("Selected:", s)} />

      {/* Example: YouTube suggestions (uncomment to try) */}
      {/* <div style={{ marginTop: 24 }}>
        <h4>YouTube</h4>
        <SearchBar hl="en" gl="us" ds="yt" onSelect={(s) => console.log("YT:", s)} />
      </div> */}
    </div>
  </React.StrictMode>
);
