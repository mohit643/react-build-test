import React, { useEffect, useRef, useState } from "react";
import "./Dashboard.css";
import DrawingCard from "./DrawingCard";
import PdfViewer from "./PdfViewer";
import { useLocation } from "react-router-dom";


export default function Dashboard() {
  const location = useLocation();
  const fileInputRef = useRef(null);
  const [user, setUser] = useState(null);

  const [pdfs, setPdfs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItem, setSelectedItem] = useState(null);

  const [edit, setEdit] = useState(false);
  const [view, setView] = useState(false);

  const itemsPerPage = 12;

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

  const totalPages = Math.ceil(pdfs.length / itemsPerPage);
  const currentItems = pdfs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    fetchAndShowPdfs();

    const userParam = new URLSearchParams(location.search).get("user");
    if (userParam) {
      try {
        setUser(JSON.parse(decodeURIComponent(userParam)));
      } catch (error) {
        console.error("User parsing failed:", error);
      }
    }
  }, []);

  const fetchAndShowPdfs = async (filters = {}) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams(filters).toString();
      const url = `https://remixbackend-badjarfeekbufqb3.canadacentral-01.azurewebsites.net/${
        params ? "filter-pdfs-azure?" + params : "all-pdfs-azure"
      }`;
      const res = await fetch(url);
      if (
        !res.ok ||
        !res.headers.get("content-type")?.includes("application/json")
      )
        throw new Error();
      const data = await res.json();
      setPdfs(data.pdfs || []);
    } catch (err) {
      console.error("Error fetching PDFs:", err);
      setPdfs([]);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
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

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUpload = async () => {
    if (!form.pdfFile) {
      return alert("📎 Please select a PDF file to upload.");
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append("email", user?.mail || "");
    formData.append("description", form.description);
    formData.append("status", form.status);
    formData.append("bolt_hole_size", form.bolt_hole_size);
    formData.append("bolt_pattern", form.bolt_pattern);
    formData.append("bolt_circle_diameter", form.bolt_circle_diameter);
    formData.append("bolt_hole_style", form.bolt_hole_style);
    formData.append("itemNumber", form.itemNumber);
    formData.append("pdf", form.pdfFile);

    try {
      const response = await fetch(
        `https://remixbackend-badjarfeekbufqb3.canadacentral-01.azurewebsites.net/upload-pdf-azure`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        alert("✅ Uploaded successfully.");
        fetchAndShowPdfs();
      } else {
        const result = await response.json();
        alert(`❌ Upload failed: ${result?.message || "Server error."}`);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Upload failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const getViewData = (item) => {
    setSelectedItem(item);
    setForm({
      itemNumber: item.itemNumber || "",
      description: item.description || "",
      pdfFile: null, // Reset file input, kyunki file URL se directly form me nahi set kar sakte
      status: item.status ? [item.status] : [], // status ko array me daal diya
      bolt_hole_size: item.bolt_hole_size || "",
      bolt_pattern: item.bolt_pattern || "",
      bolt_circle_diameter: item.bolt_circle_diameter || "",
      bolt_hole_style: item.bolt_hole_style || "",
      id: item.id,
      blobUrl: item.pdf, // Assuming item.pdf is the blob URL
    });
    setView(true);
  };

  const getEditData = (item) => {
    setEdit(true);
    setSelectedItem(item);
    setForm({
      itemNumber: item.itemNumber || "",
      description: item.description || "",
      pdfFile: null, // Reset file input, kyunki file URL se directly form me nahi set kar sakte
      status: item.status ? [item.status] : [], // status ko array me daal diya
      bolt_hole_size: item.bolt_hole_size || "",
      bolt_pattern: item.bolt_pattern || "",
      bolt_circle_diameter: item.bolt_circle_diameter || "",
      bolt_hole_style: item.bolt_hole_style || "",
      id: item.id,
      blobUrl: item.pdf, // Assuming item.pdf is the blob URL
    });
  };

  const handleEdit = async () => {
    setIsLoading(true);
    const formData = new FormData();
    formData.append("email", user?.mail || "");
    formData.append("description", form.description);
    formData.append("status", form.status);
    formData.append("bolt_hole_size", form.bolt_hole_size);
    formData.append("bolt_pattern", form.bolt_pattern);
    formData.append("bolt_circle_diameter", form.bolt_circle_diameter);
    formData.append("bolt_hole_style", form.bolt_hole_style);
    formData.append("itemNumber", form.itemNumber);
    formData.append("id", form.id);

    if (form.blobUrl) {
      formData.append("blobUrl", form.blobUrl);
    }
    if (form.pdfFile) {
      formData.append("pdf", form.pdfFile);
    }
    try {
      const response = await fetch(
        `https://remixbackend-badjarfeekbufqb3.canadacentral-01.azurewebsites.net/edit-pdf-azure`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        alert("✅ Updated successfully.");

        fetchAndShowPdfs();
      } else {
        const result = await response.json();
        alert(`❌ Edit failed: ${result?.message || "Server error."}`);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Edit failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const filters = {};
    Object.entries(form).forEach(([key, value]) => {
      if (Array.isArray(value) && value.length > 0)
        filters[key] = value.join(",");
      else if (typeof value === "string" && value.trim() !== "")
        filters[key] = value;
    });
    fetchAndShowPdfs(filters);
  };

  const handleInputChange = (e) => {
    const { className, type, value, checked, files } = e.target;

    // Agar checkbox hai aur status array ka part hai
    if (type === "checkbox") {
      if (checked) {
        setForm({
          ...form,
          status: value, // replace existing status with new one
        });
      } else {
        setForm({
          ...form,
          status: "", // uncheck means no status selected
        });
      }
    }

    // Agar file hai
    else if (type === "file") {
      setForm({
        ...form,
        pdfFile: files[0],
      });
    }
    // Normal text input
    else {
      setForm({
        ...form,
        [className]: value,
      });
    }
  };

  const handleLogout = () => {
    window.location.href =
      "https://login.microsoftonline.com/common/oauth2/v2.0/logout?post_logout_redirect_uri=https://remixfrontend-brbnd3hvaudwc0dw.canadacentral-01.azurewebsites.net/login";
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

          <form className="upload-form">
            <h4>{edit ? "Edit" : "Upload"}</h4>
            <button
              style={{ display: edit || view ? "none" : "" }}
              type="button"
              onClick={handleSearch}
            >
              🔍 Search
            </button>
            <input
              type="text"
              className="itemNumber"
              placeholder="Item Number"
              value={form.itemNumber}
              onChange={handleInputChange}
              readOnly={view}
            />
            <input
              type="text"
              placeholder="description"
              className="description"
              value={form.description}
              onChange={handleInputChange}
              readOnly={view}
            />
            <input
              type="file"
              accept="application/pdf"
              className="flie"
              ref={fileInputRef}
              onChange={handleInputChange}
              disabled={view}
            />

            <div className="status-section">
              <p>Status</p>
              <div style={{ display: "flex" }}>
                {["active", "slow moving", "archive"].map((status) => (
                  <label key={status}>
                    <input
                      type="checkbox"
                      className="status"
                      checked={form.status == status}
                      onChange={handleInputChange}
                      value={status}
                      disabled={view}
                    />
                    {status}
                  </label>
                ))}
              </div>
            </div>

            <div className="bolt-section">
              <div className="bolt-row">
                <input
                  type="text"
                  placeholder="Bolt Hole Size"
                  className="bolt_hole_size"
                  value={form.bolt_hole_size}
                  onChange={handleInputChange}
                  readOnly={view}
                />
                <input
                  type="text"
                  placeholder="Bolt Hole Pattern"
                  className="bolt_pattern"
                  value={form.bolt_pattern}
                  onChange={handleInputChange}
                  readOnly={view}
                />
              </div>
              <div className="bolt-row">
                <input
                  type="text"
                  placeholder="Bolt Circle Diameter"
                  className="bolt_circle_diameter"
                  value={form.bolt_circle_diameter}
                  onChange={handleInputChange}
                  readOnly={view}
                />
                <input
                  type="text"
                  placeholder="Bolt Hole Style"
                  className="bolt_hole_style"
                  value={form.bolt_hole_style}
                  onChange={handleInputChange}
                  readOnly={view}
                />
              </div>
            </div>
            <button
              style={{ display: !edit ? "none" : "" }}
              type="button"
              onClick={handleEdit}
            >
              ✏️ EdIt
            </button>

            <button
              style={{ display: edit || view ? "none" : "" }}
              type="button"
              onClick={handleUpload}
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
                  onClick={() => {
                    setSelectedItem(null);
                    resetForm();
                    setEdit(false);
                    setView(false);
                  }}
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
                {currentItems.map((item, index) => (
                  <DrawingCard
                    key={item.pdf_record_id || index}
                    item={{
                      id: item.pdf_record_id || index,
                      title: item.pdf_name || `Untitled-${index + 1}`,
                      pdf:
                        item.blobUrl ||
                        `data:application/pdf;base64,${item.pdf_base64}`,
                      createddate: item.uploadedAt || "N/A",
                      description: item.description || "",
                      status: item.status || "",
                      itemNumber: item.itemNumber || "",
                      bolt_hole_size: item.bolt_hole_size || "",
                      bolt_pattern: item.bolt_pattern || "",
                      bolt_circle_diameter: item.bolt_circle_diameter || "",
                      bolt_hole_style: item.bolt_hole_style || "",
                    }}
                    onEdit={getEditData}
                    onView={getViewData}
                  />
                ))}
              </div>
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={currentPage === index + 1 ? "active" : ""}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    </>
  );
}
