import React from "react";
import "./Viewer.css";

export default function Viewer({ item, goBack }) {
  return (
    <div className="viewer">
      <aside className="sidebar">
        <h3>Leo Farnades</h3>
        <p>System Engineer</p>
        <button onClick={goBack}>Back</button>
      </aside>
      <main className="drawing-view">
        <img src="/drawing-full.png" alt="drawing" className="drawing-img" />
      </main>
    </div>
  );
}
