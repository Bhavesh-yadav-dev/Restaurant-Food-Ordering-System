// pages/customer/CartPage.jsx
// Shows the customer's current cart and lets them adjust quantities,
// remove items, and place the final order.
//
// On "Place Order":
//  1. Calls POST /api/orders with table_number + items
//  2. Clears the cart
//  3. Navigates to /order-confirmation passing order details in router state

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext.jsx";
import { placeOrder } from "../../services/api.js";
import styles from "./CartPage.module.css";

const CartPage = () => {
  const navigate = useNavigate();
  const {
    cart,
    tableNumber,
    totalAmount,
    totalItems,
    increaseQty,
    decreaseQty,
    removeItem,
    clearCart,
  } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);

  // Empty cart state
  if (cart.length === 0) {
    return (
      <div className={styles.empty}>
        <h2>Your cart is empty</h2>
        <p>Go back to the menu and add some items.</p>
        <button
          className={styles.backBtn}
          onClick={() => navigate(`/menu/${tableNumber || 1}`)}
        >
          ← Back to Menu
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async () => {
    if (!tableNumber) {
      setError("Table number is missing. Please scan the QR code again.");
      return;
    }

    // Build the payload the API expects
    const orderPayload = {
      table_number: tableNumber,
      items: cart.map((item) => ({
        menu_id: item.id,
        quantity: item.quantity,
        price: item.price,
      })),
    };

    try {
      setLoading(true);
      setError(null);
      const res = await placeOrder(orderPayload);
      const orderData = res.data.data; // { order_id, table_number, total_amount, status }

      clearCart();

      // Pass order details to the confirmation page via router state
      navigate("/order-confirmation", { state: { order: orderData } });
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to place order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          className={styles.backLink}
          onClick={() => navigate(`/menu/${tableNumber}`)}
          aria-label="Back to menu"
        >
          ← Menu
        </button>
        <h1 className={styles.title}>Your Cart</h1>
        <span className={styles.tableTag}>Table {tableNumber}</span>
      </header>

      {/* ── Cart Items ────────────────────────────────────────────────── */}
      <div className={styles.itemList}>
        {cart.map((item) => (
          <div key={item.id} className={styles.item}>
            <div className={styles.itemInfo}>
              <h3 className={styles.itemName}>{item.name}</h3>
              <p className={styles.itemPrice}>₹{Number(item.price).toFixed(2)} each</p>
            </div>

            {/* Quantity controls */}
            <div className={styles.qtyControls}>
              <button
                className={styles.qtyBtn}
                onClick={() => decreaseQty(item.id)}
                aria-label="Decrease quantity"
              >
                −
              </button>
              <span className={styles.qty}>{item.quantity}</span>
              <button
                className={styles.qtyBtn}
                onClick={() => increaseQty(item.id)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>

            <span className={styles.subtotal}>
              ₹{(item.price * item.quantity).toFixed(2)}
            </span>

            <button
              className={styles.removeBtn}
              onClick={() => removeItem(item.id)}
              aria-label={`Remove ${item.name}`}
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* ── Order Summary ─────────────────────────────────────────────── */}
      <div className={styles.summary}>
        <div className={styles.summaryRow}>
          <span>Items ({totalItems})</span>
          <span>₹{totalAmount.toFixed(2)}</span>
        </div>
        <div className={styles.summaryRow + " " + styles.total}>
          <span>Total</span>
          <span>₹{totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* ── Error ─────────────────────────────────────────────────────── */}
      {error && <p className={styles.error}>{error}</p>}

      {/* ── Place Order Button ────────────────────────────────────────── */}
      <button
        className={styles.orderBtn}
        onClick={handlePlaceOrder}
        disabled={loading}
      >
        {loading ? "Placing Order..." : "Place Order"}
      </button>
    </div>
  );
};

export default CartPage;
