import React, { useEffect, useRef } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist/build/pdf";

GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;

export default function PdfViewer({ pdfUrl }) {
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null); // 👈 to store current render task

  useEffect(() => {
    const renderPdf = async () => {
      const loadingTask = getDocument(pdfUrl);
      const pdf = await loadingTask.promise;
      const page = await pdf.getPage(1);

      const scale = 1.5;
      const viewport = page.getViewport({ scale });

      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      // Cancel previous render task if running
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      const renderTask = page.render(renderContext);
      renderTaskRef.current = renderTask;

      try {
        await renderTask.promise;
      } catch (err) {
        if (err?.name !== "RenderingCancelledException") {
          console.error("PDF render error:", err);
        }
      }
    };

    renderPdf();

    return () => {
      // cancel on unmount
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [pdfUrl]);

  return (
    <div className="pdf-canvas-container">
      <canvas ref={canvasRef}></canvas>
    </div>
  );
}
