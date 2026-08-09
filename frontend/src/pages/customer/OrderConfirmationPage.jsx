// pages/customer/OrderConfirmationPage.jsx
// Shown after the customer successfully places an order.
// Reads the initial order details from router state (passed by CartPage).
//
// IMPORTANT: Polls GET /api/orders/:id every 10 seconds so the status
// shown here (Pending → Preparing → Ready → Completed) stays up to date
// without any page refresh.

import React, { useEffect, useState, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchOrderDetails } from "../../services/api.js";
import styles from "./OrderConfirmationPage.module.css";

const POLL_INTERVAL_MS = 10000; // 10 seconds

// Badge style map — matches what OrdersDashboardPage uses
const STATUS_BADGE_CLASS = {
  Pending:   styles.badgePending,
  Preparing: styles.badgePreparing,
  Ready:     styles.badgeReady,
  Completed: styles.badgeCompleted,
};

// Human-readable status messages shown below the badge
const STATUS_MESSAGE = {
  Pending:   "Your order has been received. The chef will start soon.",
  Preparing: "The chef is preparing your order. Won't be long!",
  Ready:     "Your order is ready! It will be brought to your table.",
  Completed: "Order completed. Enjoy your meal!",
};

const OrderConfirmationPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Initial data passed from CartPage via navigate state
  const initialOrder = location.state?.order;

  const [order, setOrder]   = useState(initialOrder || null);
  const [pollError, setPollError] = useState(false);
  const intervalRef = useRef(null);

  // ── Poll the order status ───────────────────────────────────────────────────
  useEffect(() => {
    if (!initialOrder?.order_id) return; // nothing to poll if no order

    const pollStatus = async () => {
      try {
        const res = await fetchOrderDetails(initialOrder.order_id);
        const updated = res.data.data;
        // Merge fresh status + updated_at into our local order state
        setOrder((prev) => ({
          ...prev,
          status: updated.status,
          updated_at: updated.updated_at,
        }));
        setPollError(false);

        // Stop polling once the order is completed
        if (updated.status === "Completed") {
          clearInterval(intervalRef.current);
        }
      } catch {
        setPollError(true); // Show a subtle warning but don't break the page
      }
    };

    // Poll immediately, then every POLL_INTERVAL_MS
    pollStatus();
    intervalRef.current = setInterval(pollStatus, POLL_INTERVAL_MS);

    return () => clearInterval(intervalRef.current); // cleanup on unmount
  }, [initialOrder?.order_id]);

  // ── Fallback: no order data at all ─────────────────────────────────────────
  if (!order) {
    return (
      <div className={styles.page}>
        <div className={styles.card}>
          <div className={styles.icon}>✓</div>
          <h1 className={styles.heading}>Order Placed!</h1>
          <p className={styles.sub}>Your order has been received by the kitchen.</p>
        </div>
      </div>
    );
  }

  const badgeClass = STATUS_BADGE_CLASS[order.status] || styles.badgePending;
  const statusMsg  = STATUS_MESSAGE[order.status] || "";

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Success icon */}
        <div className={styles.icon} aria-hidden="true">✓</div>

        <h1 className={styles.heading}>Order Placed Successfully!</h1>
        <p className={styles.sub}>
          Updates appear automatically — no need to refresh.
        </p>

        {/* Live status banner */}
        <div className={`${styles.statusBanner} ${badgeClass}`}>
          <span className={styles.statusLabel}>Status</span>
          <span className={styles.statusValue}>{order.status}</span>
        </div>

        {/* Status message */}
        <p className={styles.statusMsg}>{statusMsg}</p>

        {/* Subtle poll-error notice */}
        {pollError && (
          <p className={styles.pollError}>
            ⚠ Could not reach server. Retrying...
          </p>
        )}

        {/* Order details */}
        <div className={styles.details}>
          <div className={styles.row}>
            <span className={styles.label}>Order ID</span>
            <span className={styles.value}>#{order.order_id}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Table Number</span>
            <span className={styles.value}>{order.table_number}</span>
          </div>
          <div className={styles.row}>
            <span className={styles.label}>Total Amount</span>
            <span className={styles.value}>
              ₹{Number(order.total_amount).toFixed(2)}
            </span>
          </div>
        </div>

        {/* Polling indicator — disappears when completed */}
        {order.status !== "Completed" && (
          <p className={styles.pollNote}>
            🔄 Status refreshes automatically every 10 seconds
          </p>
        )}

        <button
          className={styles.orderAgainBtn}
          onClick={() => navigate(`/menu/${order.table_number}`)}
        >
          Order More Items
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;
