import React, { useEffect, useState } from "react";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist/build/pdf";
import downloadIcon from "../assets/dummy-pdfs/download.png";
import "./DrawingCard.css";

// 👇 PDF.js के worker की path set करें
GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export default function DrawingCard({ item, onClick }) {
  const [thumbnail, setThumbnail] = useState(null);
  useEffect(() => {
    console.log("Rendering PDF thumbnail for:", item);
    if (!item?.pdf) return;

    const renderPDFThumbnail = async () => {
      console.log("Rendering PDF thumbnail for:", item.pdf);

      try {
        const loadingTask = getDocument(item.pdf);
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        // Fixed thumbnail size
        const FIXED_WIDTH = 200;
        const FIXED_HEIGHT = 200;

        const viewport = page.getViewport({ scale: 1 });
        const scale = Math.max(
          FIXED_WIDTH / viewport.width,
          FIXED_HEIGHT / viewport.height
        ); // 👈 zoom in
        const scaledViewport = page.getViewport({ scale });

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        // Canvas remains fixed size, even if PDF page is bigger
        canvas.width = FIXED_WIDTH;
        canvas.height = FIXED_HEIGHT;

        // Calculate offset to center the rendered page
        const offsetX = (FIXED_WIDTH - scaledViewport.width) / 2;
        const offsetY = (FIXED_HEIGHT - scaledViewport.height) / 2;

        // Optional: Fill background white
        context.fillStyle = "#fff";
        context.fillRect(0, 0, FIXED_WIDTH, FIXED_HEIGHT);

        // Translate and render
        context.translate(offsetX, offsetY);
        await page.render({ canvasContext: context, viewport: scaledViewport })
          .promise;

        const jpgDataUrl = canvas.toDataURL("image/jpeg");
        setThumbnail(jpgDataUrl);
      } catch (error) {
        console.error("Failed to render thumbnail:", error);
      }
    };

    renderPDFThumbnail();
  }, [item.pdf]);

  return (
    <div className="drawing-card" onClick={() => onClick(item)}>
      {thumbnail ? (
        <img src={thumbnail} alt="PDF preview" className="drawing-img" />
      ) : (
        <div className="loading-placeholder">Loading preview...</div>
      )}

      <div
        className="drawing-info"
        style={{
          height: "60px", // 👈 fixed height
          overflow: "hidden",
        }}
      >
        <strong
          style={{
            display: "block",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.title}
        </strong>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "end",
            gap: "5px",
          }}
        >
          <div
            style={{
              width: "145px",
              lineHeight: "1.2",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2, // 👈 show 2 lines max
              WebkitBoxOrient: "vertical",
            }}
          >
            <strong style={{ display: "block", margin: 0 }}>
              {item.description}
            </strong>
            <strong style={{ display: "block", margin: 0 }}>
              {item.createddate}
            </strong>
          </div>

          <div className="card-actions">
            <button className="edit-btn" onClick={(e) => e.stopPropagation()}>
              Edit
            </button>
            <a href={item.pdf} download onClick={(e) => e.stopPropagation()}>
              <button
                className="download-btn"
                style={{
                  background: "none",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              >
                <img
                  src={downloadIcon}
                  alt="Download"
                  style={{ width: "20px", height: "20px" }}
                />
              </button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
