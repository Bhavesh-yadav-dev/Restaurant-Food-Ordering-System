// context/CartContext.jsx
// Global cart state using React Context + useReducer.
//
// Why useReducer instead of useState?
// The cart has multiple operations (add, remove, increase, decrease, clear).
// useReducer keeps all that logic in one place (the reducer function)
// instead of spreading it across multiple useState setters.
//
// The context exposes:
//   cart        — array of cart items
//   tableNumber — set once from the URL when the customer lands on the menu page
//   addItem     — add item or increase qty if already in cart
//   removeItem  — remove item completely from cart
//   increaseQty — increase quantity by 1
//   decreaseQty — decrease quantity by 1 (removes if qty reaches 0)
//   clearCart   — empty the cart after order is placed
//   setTable    — store the table number from the QR code URL
//   totalAmount — derived value: sum of all item subtotals
//   totalItems  — derived value: total number of items in cart

import React, { createContext, useContext, useReducer } from "react";

// ─── Action Types ─────────────────────────────────────────────────────────────
const ADD_ITEM     = "ADD_ITEM";
const REMOVE_ITEM  = "REMOVE_ITEM";
const INCREASE_QTY = "INCREASE_QTY";
const DECREASE_QTY = "DECREASE_QTY";
const CLEAR_CART   = "CLEAR_CART";
const SET_TABLE    = "SET_TABLE";

// ─── Initial State ────────────────────────────────────────────────────────────
const initialState = {
  cart: [],
  tableNumber: null,
};

// ─── Reducer ──────────────────────────────────────────────────────────────────
const cartReducer = (state, action) => {
  switch (action.type) {

    case ADD_ITEM: {
      const existing = state.cart.find((item) => item.id === action.payload.id);
      if (existing) {
        // Item already in cart — just increase qty
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.id === action.payload.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      // New item — add with quantity 1
      return {
        ...state,
        cart: [...state.cart, { ...action.payload, quantity: 1 }],
      };
    }

    case REMOVE_ITEM:
      return {
        ...state,
        cart: state.cart.filter((item) => item.id !== action.payload),
      };

    case INCREASE_QTY:
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.payload
            ? { ...item, quantity: item.quantity + 1 }
            : item
        ),
      };

    case DECREASE_QTY: {
      const target = state.cart.find((item) => item.id === action.payload);
      if (!target) return state;
      // Remove item if quantity would drop to 0
      if (target.quantity === 1) {
        return {
          ...state,
          cart: state.cart.filter((item) => item.id !== action.payload),
        };
      }
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.id === action.payload
            ? { ...item, quantity: item.quantity - 1 }
            : item
        ),
      };
    }

    case CLEAR_CART:
      return { ...state, cart: [] };

    case SET_TABLE:
      return { ...state, tableNumber: action.payload };

    default:
      return state;
  }
};

// ─── Context ──────────────────────────────────────────────────────────────────
const CartContext = createContext(null);

// ─── Provider ─────────────────────────────────────────────────────────────────
export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Derived values computed on every render (no stale closures)
  const totalAmount = state.cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalItems = state.cart.reduce((sum, item) => sum + item.quantity, 0);

  // Action dispatchers — components call these, not dispatch directly
  const addItem     = (item) => dispatch({ type: ADD_ITEM,     payload: item });
  const removeItem  = (id)   => dispatch({ type: REMOVE_ITEM,  payload: id });
  const increaseQty = (id)   => dispatch({ type: INCREASE_QTY, payload: id });
  const decreaseQty = (id)   => dispatch({ type: DECREASE_QTY, payload: id });
  const clearCart   = ()     => dispatch({ type: CLEAR_CART });
  const setTable    = (num)  => dispatch({ type: SET_TABLE,    payload: num });

  return (
    <CartContext.Provider
      value={{
        cart: state.cart,
        tableNumber: state.tableNumber,
        totalAmount,
        totalItems,
        addItem,
        removeItem,
        increaseQty,
        decreaseQty,
        clearCart,
        setTable,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ─── Custom Hook ──────────────────────────────────────────────────────────────
// useCart() is cleaner than importing useContext + CartContext in every file
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside a CartProvider");
  }
  return context;
};

export default CartContext;
