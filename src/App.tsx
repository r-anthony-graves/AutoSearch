import React from "react";
import { SearchBar } from "./components/SearchBar";

export default function App() {
  return (
    <div style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <h2 style={{ marginBottom: 12 }}>Autosuggest (Wikipedia, no key)</h2>
      <p style={{ color: "#555", marginTop: 0 }}>
        Start typing to see suggestions. Select an item to log it in the console.
      </p>
      <SearchBar
        apiBase="http://localhost:8000"
        // language="en"
        // limit={8}
        onSelect={(s) => console.log("Selected:", s)}
      />
    </div>
  );
}
