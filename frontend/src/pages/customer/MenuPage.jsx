// pages/customer/MenuPage.jsx
// The main customer-facing page. Opened when a customer scans the QR code.
// URL: /menu/:tableNumber
//
// Responsibilities:
//  1. Read tableNumber from the URL param and store it in CartContext
//  2. Fetch available menu items from the API
//  3. Render each item as a card with an "Add to Cart" button
//  4. Show a floating cart summary bar at the bottom

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchCustomerMenu } from "../../services/api.js";
import { useCart } from "../../context/CartContext.jsx";
import styles from "./MenuPage.module.css";

const MenuPage = () => {
  const { tableNumber } = useParams(); // from /menu/:tableNumber
  const navigate = useNavigate();
  const { addItem, totalItems, totalAmount, setTable } = useCart();

  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  // Store the table number in context so CartPage and PlaceOrder can use it
  useEffect(() => {
    if (tableNumber) {
      setTable(Number(tableNumber));
    }
  }, [tableNumber, setTable]);

  // Fetch available menu items on mount
  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoading(true);
        const res = await fetchCustomerMenu();
        setMenuItems(res.data.data);
      } catch (err) {
        setError("Failed to load menu. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    loadMenu();
  }, []);

  if (loading) return <div className={styles.center}>Loading menu...</div>;
  if (error)   return <div className={styles.center + " " + styles.error}>{error}</div>;

  return (
    <div className={styles.page}>
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header className={styles.header}>
        <h1 className={styles.title}>Our Menu</h1>
        <p className={styles.tableTag}>Table {tableNumber}</p>
      </header>

      {/* ── Menu Grid ──────────────────────────────────────────────────── */}
      <div className={styles.grid}>
        {menuItems.map((item) => (
          <div key={item.id} className={styles.card}>
            {/* Optional image */}
            {item.image && (
              <img src={item.image} alt={item.name} className={styles.image} />
            )}

            <div className={styles.cardBody}>
              <h3 className={styles.itemName}>{item.name}</h3>
              <p className={styles.description}>{item.description}</p>

              <div className={styles.cardFooter}>
                <span className={styles.price}>₹{Number(item.price).toFixed(2)}</span>
                <button
                  className={styles.addBtn}
                  onClick={() => addItem(item)}
                  aria-label={`Add ${item.name} to cart`}
                >
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Floating Cart Bar (visible when cart has items) ────────────── */}
      {totalItems > 0 && (
        <div className={styles.cartBar}>
          <span>{totalItems} item{totalItems > 1 ? "s" : ""} in cart</span>
          <span className={styles.cartTotal}>₹{totalAmount.toFixed(2)}</span>
          <button
            className={styles.viewCartBtn}
            onClick={() => navigate("/cart")}
          >
            View Cart →
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuPage;
