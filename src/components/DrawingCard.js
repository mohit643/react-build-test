import React, { useEffect, useState } from "react";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist/build/pdf";
import downloadIcon from "../assets/dummy-pdfs/download.png";
import "./DrawingCard.css";

GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

export default function DrawingCard({ item, onEdit, onView }) {
  const [thumbnail, setThumbnail] = useState(null);

  useEffect(() => {
    const renderPDFThumbnail = async () => {
      if (!item?.pdf) return;
      try {
        const loadingTask = getDocument({ url: item.pdf });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");

        const viewport = page.getViewport({ scale: 1.5 });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({ canvasContext: context, viewport }).promise;

        setThumbnail(canvas.toDataURL("image/jpeg"));
      } catch (error) {
        console.error("PDF render error:", error);
      }
    };

    renderPDFThumbnail();
  }, [item?.pdf]);

  if (!item) return null;

  return (
    <div
      className="drawing-card"
      // onClick={() => onClick?.(item)}
      style={{ cursor: "pointer", position: "relative" }}
    >
      {thumbnail ? (
        <img
          onClick={(e) => {
            e.stopPropagation(); // Prevent card click
            onView?.(item);
          }}
          src={thumbnail}
          alt="PDF preview"
          className="drawing-img"
        />
      ) : (
        <div className="loading-placeholder">Loading preview...</div>
      )}

      <div
        className="drawing-info"
        style={{ height: "60px", overflow: "hidden" }}
      >
        <strong
          style={{
            display: "block",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {item.itemNumber}
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
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            <strong>{item.description}</strong>
            <br />
            <small>{item.createddate}</small>
          </div>

          <div className="card-actions" style={{ display: "flex", gap: "5px" }}>
            <button
              className="edit-btn"
              onClick={(e) => {
                e.stopPropagation(); // Prevent card click
                onEdit?.(item);
              }}
            >
              Edit
            </button>

            <button
              className="download-btn"
              onClick={async (e) => {
                e.stopPropagation(); // Prevent card click
                try {
                  const res = await fetch(item.pdf);
                  if (!res.ok) throw new Error("Failed to fetch PDF");

                  const blob = await res.blob();
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${
                    item.title?.replace(/\s+/g, "_") || "download"
                  }.pdf`;
                  a.click();
                  a.remove();
                  URL.revokeObjectURL(url);
                } catch (err) {
                  console.error("Download failed:", err);
                  alert("❌ Download failed");
                }
              }}
              style={{
                background: "none",
                border: "none",
                padding: 0,
                cursor: "pointer",
              }}
            >
              <img src={downloadIcon} alt="Download" width={20} height={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
