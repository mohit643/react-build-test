import React, { useState, useRef } from "react";

function FileInputWithName() {
  const [fileName, setFileName] = useState("");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    } else {
      setFileName("");
    }
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <input
        type="text"
        readOnly
        value={fileName}
        placeholder="No file chosen"
        style={{ width: "250px", padding: "8px" }}
      />
      <button type="button" onClick={handleClick}>
        Choose File
      </button>
      <input
        type="file"
        accept="application/pdf"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
    </div>
  );
}

export default FileInputWithName;
