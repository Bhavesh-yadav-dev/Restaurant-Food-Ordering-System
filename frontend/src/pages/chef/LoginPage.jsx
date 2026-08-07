// pages/chef/LoginPage.jsx
// Simple login form for the chef.
// No JWT, no session tokens — just stores the chef object in localStorage
// so the dashboard can read the chef's name. This is prototype-level auth only.

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { chefLogin } from "../../services/api.js";
import styles from "./LoginPage.module.css";

const LoginPage = () => {
  const navigate = useNavigate();

  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!form.email || !form.password) {
      setError("Both email and password are required.");
      return;
    }

    try {
      setLoading(true);
      const res = await chefLogin(form);
      // Store chef info (no sensitive data) for use across chef pages
      localStorage.setItem("chef", JSON.stringify(res.data.data));
      navigate("/chef/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>Chef Login</h1>
        <p className={styles.sub}>Restaurant Management System</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="email" className={styles.label}>Email</label>
            <input
              id="email"
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="chef@restaurant.com"
              className={styles.input}
              autoComplete="email"
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="password" className={styles.label}>Password</label>
            <input
              id="password"
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={styles.input}
              autoComplete="current-password"
            />
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        {/* Hint for prototype testing */}
        <p className={styles.hint}>
          Demo credentials: chef@restaurant.com / chef123
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
