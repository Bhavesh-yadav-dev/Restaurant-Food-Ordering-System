// pages/chef/DashboardPage.jsx
// Landing page after chef login.
// Shows two navigation cards: Manage Menu and View Orders.
// Also shows the logged-in chef's name read from localStorage.

import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "./DashboardPage.module.css";

const DashboardPage = () => {
  const navigate = useNavigate();

  // Read chef info saved during login
  const chef = (() => {
    try {
      return JSON.parse(localStorage.getItem("chef"));
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    localStorage.removeItem("chef");
    navigate("/chef/login");
  };

  return (
    <div className={styles.page}>
      {/* ── Top bar ──────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          {chef && (
            <p className={styles.welcome}>Welcome back, {chef.name}</p>
          )}
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Logout
        </button>
      </header>

      {/* ── Navigation cards ─────────────────────────────────────────── */}
      <div className={styles.grid}>
        <button
          className={styles.card}
          onClick={() => navigate("/chef/menu")}
        >
          <span className={styles.cardIcon} aria-hidden="true">🍽️</span>
          <h2 className={styles.cardTitle}>Manage Menu</h2>
          <p className={styles.cardDesc}>
            Add, edit, delete items and toggle availability.
          </p>
        </button>

        <button
          className={styles.card}
          onClick={() => navigate("/chef/orders")}
        >
          <span className={styles.cardIcon} aria-hidden="true">📋</span>
          <h2 className={styles.cardTitle}>View Orders</h2>
          <p className={styles.cardDesc}>
            See all incoming orders and update their status.
          </p>
        </button>

        <button
          className={styles.card}
          onClick={() => navigate("/chef/qr-generator")}
        >
          <span className={styles.cardIcon} aria-hidden="true">📱</span>
          <h2 className={styles.cardTitle}>QR Code Generator</h2>
          <p className={styles.cardDesc}>
            Generate and download QR codes for each table.
          </p>
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
