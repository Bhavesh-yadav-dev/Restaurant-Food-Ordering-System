-- =============================================================================
-- Restaurant Food Ordering System — Database Schema
-- =============================================================================
-- Run this file once to set up the entire database.
-- How to run:
--   mysql -u root -p < database.sql
-- Or paste it directly into MySQL Workbench / phpMyAdmin.
-- =============================================================================

-- Create the database if it doesn't already exist
CREATE DATABASE IF NOT EXISTS restaurant_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE restaurant_db;

-- =============================================================================
-- TABLE: chef
-- Stores login credentials for kitchen staff.
-- Password is stored as plain text for this prototype only.
-- In production, always hash passwords (e.g. bcrypt).
-- =============================================================================
CREATE TABLE IF NOT EXISTS chef (
  id         INT           NOT NULL AUTO_INCREMENT,
  name       VARCHAR(100)  NOT NULL,
  email      VARCHAR(150)  NOT NULL,
  password   VARCHAR(255)  NOT NULL,
  created_at TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  UNIQUE KEY uq_chef_email (email)   -- Prevent duplicate chef accounts
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =============================================================================
-- TABLE: menu
-- Stores all food items offered by the restaurant.
-- available = 1 means the item is shown to customers.
-- available = 0 means it is hidden from the customer menu.
-- =============================================================================
CREATE TABLE IF NOT EXISTS menu (
  id          INT             NOT NULL AUTO_INCREMENT,
  name        VARCHAR(150)    NOT NULL,
  description TEXT            NOT NULL,
  price       DECIMAL(10, 2)  NOT NULL,
  image       VARCHAR(500)        NULL DEFAULT NULL,  -- Optional image URL
  available   TINYINT(1)      NOT NULL DEFAULT 1,     -- 1 = available, 0 = not
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP
                                       ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_menu_available (available)  -- Speeds up customer menu queries
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =============================================================================
-- TABLE: orders
-- One row per customer order. Linked to table via table_number.
-- Status follows the flow: Pending → Preparing → Ready → Completed
-- =============================================================================
CREATE TABLE IF NOT EXISTS orders (
  id           INT            NOT NULL AUTO_INCREMENT,
  table_number INT            NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status       ENUM(
                 'Pending',
                 'Preparing',
                 'Ready',
                 'Completed'
               )              NOT NULL DEFAULT 'Pending',
  created_at   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP      NOT NULL DEFAULT CURRENT_TIMESTAMP
                                        ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),
  INDEX idx_orders_status       (status),        -- Filter by status on dashboard
  INDEX idx_orders_table_number (table_number)   -- Look up orders by table
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =============================================================================
-- TABLE: order_items
-- One row per food item within an order.
-- price is stored here (not referenced from menu) so historical prices
-- are preserved even if the menu price changes later.
-- =============================================================================
CREATE TABLE IF NOT EXISTS order_items (
  id       INT            NOT NULL AUTO_INCREMENT,
  order_id INT            NOT NULL,
  menu_id  INT            NOT NULL,
  quantity INT            NOT NULL,
  price    DECIMAL(10, 2) NOT NULL,   -- Price at time of order
  subtotal DECIMAL(10, 2) NOT NULL,   -- price × quantity

  PRIMARY KEY (id),

  -- Foreign key to orders: delete items when the order is deleted
  CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  -- Foreign key to menu: restrict deletion of a menu item if it's in an order
  CONSTRAINT fk_order_items_menu
    FOREIGN KEY (menu_id) REFERENCES menu (id)
    ON DELETE RESTRICT
    ON UPDATE CASCADE,

  INDEX idx_order_items_order_id (order_id),   -- Fast lookup of items by order
  INDEX idx_order_items_menu_id  (menu_id)     -- Fast lookup by menu item
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- =============================================================================
-- SEED DATA
-- Pre-populates the database so you can test the app immediately.
-- =============================================================================

-- ── Chef ──────────────────────────────────────────────────────────────────────
-- Login credentials:  chef@restaurant.com / chef123
INSERT INTO chef (name, email, password) VALUES
  ('Head Chef', 'chef@restaurant.com', 'chef123');


-- ── Menu Items ────────────────────────────────────────────────────────────────
INSERT INTO menu (name, description, price, image, available) VALUES
  ('Margherita Pizza',
   'Classic pizza with fresh tomato sauce, mozzarella, and basil.',
   12.99, NULL, 1),

  ('Cheeseburger',
   'Juicy beef patty with cheddar cheese, lettuce, tomato, and pickles.',
   9.99, NULL, 1),

  ('Grilled Chicken Sandwich',
   'Tender grilled chicken breast with mayo and lettuce on a toasted bun.',
   10.49, NULL, 1),

  ('Pasta Carbonara',
   'Creamy pasta with pancetta, egg, parmesan, and black pepper.',
   13.49, NULL, 1),

  ('Caesar Salad',
   'Crisp romaine lettuce with Caesar dressing, croutons, and parmesan.',
   8.99, NULL, 1),

  ('French Fries',
   'Golden crispy fries seasoned with sea salt.',
   4.99, NULL, 1),

  ('Chocolate Lava Cake',
   'Warm chocolate cake with a gooey molten center, served with ice cream.',
   6.99, NULL, 1),

  ('Mango Lassi',
   'Chilled blended yogurt drink with fresh mango and a hint of cardamom.',
   3.99, NULL, 0);  -- Unavailable item (to test the disabled state on the menu)


-- =============================================================================
-- VERIFICATION QUERIES (optional — uncomment to check after running)
-- =============================================================================
-- SELECT * FROM chef;
-- SELECT * FROM menu;
-- SHOW CREATE TABLE order_items;
