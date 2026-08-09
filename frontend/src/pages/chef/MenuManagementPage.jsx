// pages/chef/MenuManagementPage.jsx
// Full CRUD for menu items.
//
// Features:
//  - List all items (including unavailable)
//  - Add new item via inline form
//  - Edit existing item (form pre-filled)
//  - Delete item with confirmation
//  - Toggle availability directly from the list

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchAllMenuItems,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from "../../services/api.js";
import styles from "./MenuManagementPage.module.css";

// ── Empty form state ──────────────────────────────────────────────────────────
const emptyForm = {
  name: "",
  description: "",
  price: "",
  image: "",
  available: 1,
};

const MenuManagementPage = () => {
  const navigate = useNavigate();

  const [items, setItems]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // null = form hidden; object = editing that item; "new" = adding
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // ── Fetch all menu items ────────────────────────────────────────────────────
  const loadItems = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchAllMenuItems();
      setItems(res.data.data);
    } catch {
      setError("Failed to load menu items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadItems(); }, []);

  // ── Form handlers ───────────────────────────────────────────────────────────
  const openAddForm = () => {
    setEditingItem("new");
    setForm(emptyForm);
    setFormError(null);
  };

  const openEditForm = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name,
      description: item.description,
      price: item.price,
      image: item.image || "",
      available: item.available,
    });
    setFormError(null);
  };

  const closeForm = () => {
    setEditingItem(null);
    setForm(emptyForm);
    setFormError(null);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? 1 : 0) : value,
    }));
  };

  // ── Submit: Add or Update ───────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null);

    // Basic validation
    if (!form.name.trim() || !form.description.trim() || form.price === "") {
      setFormError("Name, description, and price are required.");
      return;
    }
    if (isNaN(form.price) || Number(form.price) < 0) {
      setFormError("Price must be a valid non-negative number.");
      return;
    }

    const payload = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      image: form.image.trim() || null,
      available: Number(form.available),
    };

    try {
      setSubmitting(true);
      if (editingItem === "new") {
        await addMenuItem(payload);
      } else {
        await updateMenuItem(editingItem.id, payload);
      }
      closeForm();
      loadItems(); // Refresh the list
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save item.");
    } finally {
      setSubmitting(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────────
  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    try {
      await deleteMenuItem(item.id);
      loadItems();
    } catch {
      alert("Failed to delete item. It may be part of an existing order.");
    }
  };

  // ── Quick toggle availability ───────────────────────────────────────────────
  const handleToggleAvailability = async (item) => {
    try {
      await updateMenuItem(item.id, {
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image || null,
        available: item.available ? 0 : 1,
      });
      loadItems();
    } catch {
      alert("Failed to update availability.");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page}>
      {/* Header */}
      <header className={styles.header}>
        <button className={styles.backLink} onClick={() => navigate("/chef/dashboard")}>
          ← Dashboard
        </button>
        <h1 className={styles.title}>Menu Management</h1>
        <button className={styles.addBtn} onClick={openAddForm}>
          + Add Item
        </button>
      </header>

      {/* ── Add / Edit Form ─────────────────────────────────────────────── */}
      {editingItem !== null && (
        <div className={styles.formWrapper}>
          <h2 className={styles.formTitle}>
            {editingItem === "new" ? "Add New Item" : `Edit: ${editingItem.name}`}
          </h2>

          <form onSubmit={handleSubmit} className={styles.form} noValidate>
            <div className={styles.formRow}>
              <div className={styles.field}>
                <label className={styles.label}>Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleFormChange}
                  className={styles.input}
                  placeholder="e.g. Margherita Pizza"
                />
              </div>
              <div className={styles.field}>
                <label className={styles.label}>Price (₹) *</label>
                <input
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price}
                  onChange={handleFormChange}
                  className={styles.input}
                  placeholder="e.g. 12.99"
                />
              </div>
            </div>

            <div className={styles.field}>
              <label className={styles.label}>Description *</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleFormChange}
                className={styles.textarea}
                rows={3}
                placeholder="Describe the dish..."
              />
            </div>

            <div className={styles.formRow}>
              <div className={styles.field}>
                <label className={styles.label}>Image URL (optional)</label>
                <input
                  name="image"
                  value={form.image}
                  onChange={handleFormChange}
                  className={styles.input}
                  placeholder="https://..."
                />
              </div>
              <div className={styles.checkboxField}>
                <label className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="available"
                    checked={Boolean(form.available)}
                    onChange={handleFormChange}
                  />
                  Available
                </label>
              </div>
            </div>

            {formError && <p className={styles.formError}>{formError}</p>}

            <div className={styles.formActions}>
              <button
                type="button"
                className={styles.cancelBtn}
                onClick={closeForm}
              >
                Cancel
              </button>
              <button
                type="submit"
                className={styles.saveBtn}
                disabled={submitting}
              >
                {submitting
                  ? "Saving..."
                  : editingItem === "new"
                  ? "Add Item"
                  : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Items Table ─────────────────────────────────────────────────── */}
      {loading && <p className={styles.loading}>Loading menu items...</p>}
      {error   && <p className={styles.error}>{error}</p>}

      {!loading && !error && (
        <>
          <p className={styles.count}>{items.length} item{items.length !== 1 ? "s" : ""}</p>

          {items.length === 0 ? (
            <p className={styles.empty}>No menu items yet. Add one above.</p>
          ) : (
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className={!item.available ? styles.unavailableRow : ""}>
                      <td className={styles.nameCell}>{item.name}</td>
                      <td className={styles.descCell}>{item.description}</td>
                      <td className={styles.priceCell}>
                        ₹{Number(item.price).toFixed(2)}
                      </td>
                      <td>
                        <button
                          className={
                            item.available
                              ? styles.availableBadge
                              : styles.unavailableBadge
                          }
                          onClick={() => handleToggleAvailability(item)}
                          title="Click to toggle availability"
                        >
                          {item.available ? "Available" : "Unavailable"}
                        </button>
                      </td>
                      <td className={styles.actions}>
                        <button
                          className={styles.editBtn}
                          onClick={() => openEditForm(item)}
                        >
                          Edit
                        </button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleDelete(item)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MenuManagementPage;
