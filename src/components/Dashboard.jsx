import React, { useEffect, useRef, useState } from "react";
import "./Dashboard.css";
import DrawingCard from "./DrawingCard";
import drawing1 from "../assets/dummy-pdfs/drawing-1.pdf";
import PdfViewer from "./PdfViewer";
import { useLocation } from "react-router-dom";

export default function Dashboard({ onItemClick }) {
  const location = useLocation();
  const allItems = new Array(42).fill(0).map((_, i) => ({
    id: i + 1,
    title: `825-020-01650-02-A-${i + 1}`,
    pdf: drawing1, // Simulated PDF path
  }));

  const itemsPerPage = 12;
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);
  const [search, setSearch] = useState({ itemNumber: "", status: "" });
  const [pdfList, setPdfList] = useState([]);
  const [form, setForm] = useState({
    itemNumber: "",
    description: "",
    pdfFile: null,
    status: [],
    bolt_hole_size: "",
    bolt_pattern: "",
    bolt_circle_diameter: "",
    bolt_hole_style: "",
  });
  const fileInputRef = useRef(null);
  const totalPages = Math.ceil(pdfList.length / itemsPerPage);
  const currentItems = pdfList
    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    .map((item, i) => ({
      id: item.pdf_record_id || i + 1,
      title: item.pdf_name || `Untitled-${i + 1}`,
      pdf: `data:application/pdf;base64,${item.pdf_base64}`,
      createddate: item.createddate,
      description: item.description,
      status: item.status,
    }));

  // useEffect(() => {
  //   // fetchPdfList();
  // }, []);
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const userParam = queryParams.get("user");

    if (userParam) {
      try {
        const parsedUser = JSON.parse(decodeURIComponent(userParam));
        setUser(parsedUser);
        console.log("Full user details:", parsedUser);
      } catch (error) {
        console.error("Failed to parse user info:", error);
        setUser(null);
      }
    }
  }, [location.search]);

  const fetchPdfList = async (filters = {}) => {
    setIsLoading(true);
    try {
      const res = await fetch("http://192.168.6.18:8000/allpdfsBy-UserId", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: 33,
          pdf_file_name: filters.itemNumber || "",
          status: filters.status || "",
          description: filters.description || "",
          bolt_hole_size: filters.bolt_hole_size || "",
          bolt_pattern: filters.bolt_pattern || "",
          bolt_circle_diameter: filters.bolt_circle_diameter || "",
          bolt_hole_style: filters.bolt_hole_style || "",
        }),
      });

      const result = await res.json();
      if (res.ok) {
        setPdfList(result?.data || []);
      } else {
        alert("Failed to fetch PDF list.");
      }
    } catch (_) {
      alert("Network error while loading PDF list.");
    } finally {
      setIsLoading(false); // stop loader
    }
  };

  const handleSearch = () => {
    fetchPdfList({
      itemNumber: form.itemNumber,
      status: form.status.join(","),
      description: form.description,
      bolt_hole_size: form.bolt_hole_size,
      bolt_pattern: form.bolt_pattern,
      bolt_circle_diameter: form.bolt_circle_diameter,
      bolt_hole_style: form.bolt_hole_style,
    });
  };

  const handleUpload = async () => {
    if (!form.pdfFile) {
      alert("📎 Please select a PDF file before uploading.");
      return;
    }
    setIsLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result.split(",")[1];

      const payload = {
        user_id: 33,
        pdf_file_name: form.itemNumber || form.pdfFile.name,
        pdf_base64: base64String,
        description: form.description,
        status: form.status.join(","), // convert array to comma-separated string
        bolt_hole_size: form.bolt_hole_size,
        bolt_pattern: form.bolt_pattern,
        bolt_circle_diameter: form.bolt_circle_diameter,
        bolt_hole_style: form.bolt_hole_style,
      };

      try {
        const res = await fetch("http://192.168.6.18:8000/addpdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (res.ok) {
          alert("✅ PDF uploaded successfully.");
          setForm({
            itemNumber: "",
            description: "",
            pdfFile: null,
            status: [],
            bolt_hole_size: "",
            bolt_pattern: "",
            bolt_circle_diameter: "",
            bolt_hole_style: "",
          });
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          fetchPdfList();
        } else {
          const result = await res.json();
          alert("❌ Upload failed: " + (result?.message || "Server error."));
        }
      } catch (_) {
        alert(
          "❌ Failed to upload. Please check your network or try again later."
        );
      } finally {
        setIsLoading(false); // Stop loader
      }
    };

    reader.readAsDataURL(form.pdfFile);
  };

  const handleLogout = () => {
    window.location.href =
      "https://login.microsoftonline.com/common/oauth2/v2.0/logout?post_logout_redirect_uri=http://localhost:3001/login";
  };

  return (
    <>
      {isLoading && (
        <div className="overlay-loader">
          <div className="spinner" />
          <p style={{ color: "#fff", marginTop: "10px" }}>Loading...</p>
        </div>
      )}
      <div className="dashboard">
        <aside className="sidebar">
          <div className="user-info">
            <div className="avatar">L</div>
            <h3>{user?.displayName}</h3>
            <p>System Engineer</p>
          </div>

          <div className="sidebar-buttons">
            <button onClick={handleSearch}>🔍 Search</button>
            <button>⬆ Upload</button>
          </div>

          <form className="upload-form">
            <h4>Upload</h4>
            <input
              type="text"
              placeholder="Item Number"
              value={form.itemNumber}
              onChange={(e) => setForm({ ...form, itemNumber: e.target.value })}
            />

            <input
              type="text"
              placeholder="Description"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />

            <input
              type="file"
              accept="application/pdf"
              ref={fileInputRef}
              onChange={(e) => setForm({ ...form, pdfFile: e.target.files[0] })}
            />
            <div className="status-section">
              <p>Status</p>
              <div style={{ display: "flex" }}>
                {["active", "slow moving", "archive"].map((status) => (
                  <label key={status} style={{}}>
                    <input
                      type="checkbox"
                      checked={form.status.includes(status)}
                      onChange={(e) => {
                        const updated = e.target.checked
                          ? [...form.status, status]
                          : form.status.filter((s) => s !== status);
                        setForm({ ...form, status: updated });
                      }}
                    />{" "}
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </label>
                ))}
              </div>
            </div>

            <div className="bolt-section">
              <div className="bolt-row">
                <input
                  type="text"
                  placeholder="Bolt Hole Size"
                  value={form.bolt_hole_size}
                  onChange={(e) =>
                    setForm({ ...form, bolt_hole_size: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Bolt Hole Pattern"
                  value={form.bolt_pattern}
                  onChange={(e) =>
                    setForm({ ...form, bolt_pattern: e.target.value })
                  }
                />
              </div>
              <div className="bolt-row">
                <input
                  type="text"
                  placeholder="Bolt Circle Diameter"
                  value={form.bolt_circle_diameter}
                  onChange={(e) =>
                    setForm({ ...form, bolt_circle_diameter: e.target.value })
                  }
                />
                <input
                  type="text"
                  placeholder="Bolt Hole Style"
                  value={form.bolt_hole_style}
                  onChange={(e) =>
                    setForm({ ...form, bolt_hole_style: e.target.value })
                  }
                />
              </div>
            </div>

            <button
              type="submit"
              onClick={(e) => {
                e.preventDefault(); // 👈 prevent full page reload
                handleUpload();
              }}
            >
              ⬆ Upload
            </button>
            <button type="button" onClick={handleLogout}>
              Log Out
            </button>
          </form>
        </aside>

        <main className="content-area">
          {selectedItem ? (
            <div className="pdf-viewer">
              <div className="pdf-header">
                <button
                  className="back-btn"
                  onClick={() => setSelectedItem(null)}
                >
                  ← Back
                </button>
                <h3>{selectedItem.title}</h3>
              </div>
              <PdfViewer pdfUrl={selectedItem.pdf} />
            </div>
          ) : (
            <>
              <div className="content-grid">
                {currentItems.map((item) => (
                  <DrawingCard
                    key={item.id}
                    item={item}
                    onClick={setSelectedItem}
                  />
                ))}
              </div>

              <div className="pagination">
                {" "}
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={currentPage === index + 1 ? "active" : ""}
                    >
                      {index + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
