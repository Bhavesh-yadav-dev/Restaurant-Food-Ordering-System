// pages/chef/OrdersDashboardPage.jsx
// Displays all customer orders with their items.
// Auto-refreshes every 30 seconds using HTTP polling (no WebSockets).
//
// Features:
//  - Grouped view: each order card shows table, time, items, total, status
//  - Status update dropdown: Pending → Preparing → Ready → Completed
//  - Manual refresh button
//  - 30-second auto-poll with countdown indicator

import React, { useEffect, useState, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAllOrders, updateOrderStatus } from "../../services/api.js";
import styles from "./OrdersDashboardPage.module.css";

const POLL_INTERVAL = 30; // seconds
const STATUS_FLOW   = ["Pending", "Preparing", "Ready", "Completed"];

// Color map for status badges
const STATUS_STYLES = {
  Pending:    styles.statusPending,
  Preparing:  styles.statusPreparing,
  Ready:      styles.statusReady,
  Completed:  styles.statusCompleted,
};

const OrdersDashboardPage = () => {
  const navigate = useNavigate();

  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [countdown, setCountdown] = useState(POLL_INTERVAL);
  const [updating, setUpdating]   = useState(null); // order id being updated

  // useRef keeps the interval id stable across renders without causing re-renders
  const countdownRef = useRef(null);

  // ── Fetch orders ────────────────────────────────────────────────────────────
  const loadOrders = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError(null);
      const res = await fetchAllOrders();
      setOrders(res.data.data);
      setCountdown(POLL_INTERVAL); // Reset countdown after each fetch
    } catch {
      setError("Failed to load orders.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // ── 30-second polling ────────────────────────────────────────────────────────
  useEffect(() => {
    // Count down every second
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          loadOrders(true); // silent refresh (no spinner)
          return POLL_INTERVAL;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(countdownRef.current); // Cleanup on unmount
  }, [loadOrders]);

  // ── Update order status ─────────────────────────────────────────────────────
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      setUpdating(orderId);
      await updateOrderStatus(orderId, newStatus);
      // Update local state immediately so the UI feels instant
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch {
      alert("Failed to update order status.");
    } finally {
      setUpdating(null);
    }
  };

  // Format timestamp to readable string
  const formatTime = (ts) => {
    if (!ts) return "—";
    return new Date(ts).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
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
        <h1 className={styles.title}>Orders</h1>

        <div className={styles.pollInfo}>
          <span className={styles.countdown}>
            Refreshing in {countdown}s
          </span>
          <button
            className={styles.refreshBtn}
            onClick={() => loadOrders()}
            disabled={loading}
          >
            ↻ Refresh
          </button>
        </div>
      </header>

      {loading && <p className={styles.loading}>Loading orders...</p>}
      {error   && <p className={styles.error}>{error}</p>}

      {!loading && !error && orders.length === 0 && (
        <p className={styles.empty}>No orders yet.</p>
      )}

      {/* ── Order Cards ──────────────────────────────────────────────────── */}
      <div className={styles.orderList}>
        {orders.map((order) => (
          <div key={order.id} className={styles.card}>
            {/* Card header */}
            <div className={styles.cardHeader}>
              <div className={styles.cardMeta}>
                <span className={styles.orderId}>Order #{order.id}</span>
                <span className={styles.tableNum}>Table {order.table_number}</span>
              </div>
              <span className={styles.orderTime}>{formatTime(order.order_time)}</span>
            </div>

            {/* Items list */}
            <div className={styles.itemList}>
              {order.items && order.items.length > 0 ? (
                order.items.map((item) => (
                  <div key={item.id} className={styles.item}>
                    <span className={styles.itemName}>{item.name}</span>
                    <span className={styles.itemQty}>× {item.quantity}</span>
                    <span className={styles.itemSubtotal}>
                      ${Number(item.subtotal).toFixed(2)}
                    </span>
                  </div>
                ))
              ) : (
                <p className={styles.noItems}>No items found.</p>
              )}
            </div>

            {/* Card footer */}
            <div className={styles.cardFooter}>
              <span className={styles.total}>
                Total: <strong>${Number(order.total_amount).toFixed(2)}</strong>
              </span>

              <div className={styles.statusArea}>
                <span className={`${styles.statusBadge} ${STATUS_STYLES[order.status] || ""}`}>
                  {order.status}
                </span>

                {/* Only show dropdown if order is not completed */}
                {order.status !== "Completed" && (
                  <select
                    className={styles.statusSelect}
                    value={order.status}
                    disabled={updating === order.id}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    aria-label={`Update status for order ${order.id}`}
                  >
                    {STATUS_FLOW.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersDashboardPage;
