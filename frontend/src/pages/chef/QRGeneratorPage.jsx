// pages/chef/QRGeneratorPage.jsx
// Chef enters a table number and the page instantly generates a QR code
// that points to the customer menu URL: http://localhost:5173/menu/<tableNumber>
//
// Features:
//  - Live QR generation as the chef types (no submit needed)
//  - Download QR as a PNG image
//  - Print-friendly view
//  - Multiple QR codes can be previewed at once via "Add to list"

import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import styles from "./QRGeneratorPage.module.css";

// The base URL customers will hit when they scan the QR code.
// In production replace localhost with your actual domain.
const BASE_URL = "http://localhost:5173/menu";

const QRGeneratorPage = () => {
  const navigate = useNavigate();

  const [tableInput, setTableInput] = useState("");   // controlled input
  const [savedTables, setSavedTables] = useState([]); // list of generated QRs
  const [error, setError] = useState("");

  // Ref to the single-preview QR canvas (used for download)
  const singleQRRef = useRef(null);

  // ── Derived values ──────────────────────────────────────────────────────────
  const tableNum  = parseInt(tableInput, 10);
  const isValid   = !isNaN(tableNum) && tableNum > 0;
  const menuURL   = isValid ? `${BASE_URL}/${tableNum}` : "";

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleInputChange = (e) => {
    setError("");
    setTableInput(e.target.value);
  };

  /** Add current table number to the saved list */
  const handleAddToList = () => {
    if (!isValid) {
      setError("Please enter a valid table number first.");
      return;
    }
    if (savedTables.includes(tableNum)) {
      setError(`Table ${tableNum} is already in the list.`);
      return;
    }
    setSavedTables((prev) => [...prev, tableNum].sort((a, b) => a - b));
    setTableInput("");
    setError("");
  };

  const handleRemoveTable = (num) => {
    setSavedTables((prev) => prev.filter((t) => t !== num));
  };

  /**
   * Download a QR code canvas as a PNG file.
   * @param {number} num - table number (used for filename)
   * @param {string} canvasId - the id of the <canvas> element
   */
  const handleDownload = (num, canvasId) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `table-${num}-qr.png`;
    link.click();
  };

  /** Open a print dialog scoped to only the QR list */
  const handlePrintAll = () => {
    window.print();
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <button
          className={styles.backLink}
          onClick={() => navigate("/chef/dashboard")}
        >
          ← Dashboard
        </button>
        <h1 className={styles.title}>QR Code Generator</h1>
      </header>

      {/* ── Input section ───────────────────────────────────────────────── */}
      <div className={styles.inputSection}>
        <div className={styles.inputRow}>
          <div className={styles.inputWrapper}>
            <label htmlFor="tableNum" className={styles.label}>
              Table Number
            </label>
            <input
              id="tableNum"
              type="number"
              min="1"
              value={tableInput}
              onChange={handleInputChange}
              placeholder="e.g. 5"
              className={styles.input}
              onKeyDown={(e) => e.key === "Enter" && handleAddToList()}
            />
          </div>

          <button
            className={styles.addBtn}
            onClick={handleAddToList}
            disabled={!isValid}
          >
            + Add to List
          </button>
        </div>

        {error && <p className={styles.error}>{error}</p>}
      </div>

      {/* ── Live preview ────────────────────────────────────────────────── */}
      {isValid && (
        <div className={styles.preview}>
          <h2 className={styles.previewTitle}>Preview — Table {tableNum}</h2>
          <div className={styles.qrCard}>
            {/* QRCodeCanvas renders a <canvas> element */}
            <QRCodeCanvas
              id="preview-qr"
              value={menuURL}
              size={200}
              bgColor="#ffffff"
              fgColor="#1a252f"
              level="H"           /* High error correction — survives printing */
              includeMargin={true}
            />
            <p className={styles.qrLabel}>Table {tableNum}</p>
            <p className={styles.qrUrl}>{menuURL}</p>
            <button
              className={styles.downloadBtn}
              onClick={() => handleDownload(tableNum, "preview-qr")}
            >
              ⬇ Download PNG
            </button>
          </div>
        </div>
      )}

      {/* ── Saved QR list ───────────────────────────────────────────────── */}
      {savedTables.length > 0 && (
        <div className={styles.savedSection}>
          <div className={styles.savedHeader}>
            <h2 className={styles.savedTitle}>
              Generated QR Codes ({savedTables.length})
            </h2>
            <button
              className={styles.printBtn}
              onClick={handlePrintAll}
            >
              🖨 Print All
            </button>
          </div>

          {/* This grid is what prints */}
          <div className={styles.qrGrid} id="print-area">
            {savedTables.map((num) => {
              const url = `${BASE_URL}/${num}`;
              const canvasId = `qr-table-${num}`;
              return (
                <div key={num} className={styles.qrCard}>
                  <QRCodeCanvas
                    id={canvasId}
                    value={url}
                    size={180}
                    bgColor="#ffffff"
                    fgColor="#1a252f"
                    level="H"
                    includeMargin={true}
                  />
                  <p className={styles.qrLabel}>Table {num}</p>
                  <p className={styles.qrUrl}>{url}</p>

                  <div className={styles.cardActions}>
                    <button
                      className={styles.downloadBtn}
                      onClick={() => handleDownload(num, canvasId)}
                    >
                      ⬇ Download
                    </button>
                    <button
                      className={styles.removeBtn}
                      onClick={() => handleRemoveTable(num)}
                    >
                      ✕ Remove
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default QRGeneratorPage;
