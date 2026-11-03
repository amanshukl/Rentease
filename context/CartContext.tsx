'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { CartItem, CartState } from '@/types';
import { calculateRentalPrice } from '@/lib/utils';

type CartAction =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_TENURE'; payload: { productId: string; tenure: number } }
  | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
  | { type: 'CLEAR_CART' }
  | { type: 'LOAD_CART'; payload: CartItem[] };

interface CartContextType extends CartState {
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateTenure: (productId: string, tenure: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function calculateTotals(items: CartItem[]) {
  const totalMonthlyRent = items.reduce(
    (sum, item) =>
      sum + calculateRentalPrice(item.monthlyRent, item.tenure) * item.quantity,
    0
  );
  const totalSecurityDeposit = items.reduce(
    (sum, item) => sum + item.securityDeposit * item.quantity,
    0
  );
  return { totalMonthlyRent, totalSecurityDeposit };
}

function cartReducer(state: CartState, action: CartAction): CartState {
  let newItems: CartItem[];

  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(
        (item) => item.productId === action.payload.productId
      );
      if (existingIndex > -1) {
        newItems = [...state.items];
        newItems[existingIndex] = {
          ...newItems[existingIndex],
          quantity: newItems[existingIndex].quantity + 1,
        };
      } else {
        newItems = [...state.items, action.payload];
      }
      return { items: newItems, ...calculateTotals(newItems) };
    }

    case 'REMOVE_ITEM':
      newItems = state.items.filter(
        (item) => item.productId !== action.payload
      );
      return { items: newItems, ...calculateTotals(newItems) };

    case 'UPDATE_TENURE':
      newItems = state.items.map((item) =>
        item.productId === action.payload.productId
          ? { ...item, tenure: action.payload.tenure }
          : item
      );
      return { items: newItems, ...calculateTotals(newItems) };

    case 'UPDATE_QUANTITY':
      newItems = state.items.map((item) =>
        item.productId === action.payload.productId
          ? { ...item, quantity: Math.max(1, action.payload.quantity) }
          : item
      );
      return { items: newItems, ...calculateTotals(newItems) };

    case 'CLEAR_CART':
      return { items: [], totalMonthlyRent: 0, totalSecurityDeposit: 0 };

    case 'LOAD_CART':
      return { items: action.payload, ...calculateTotals(action.payload) };

    default:
      return state;
  }
}

const initialState: CartState = {
  items: [],
  totalMonthlyRent: 0,
  totalSecurityDeposit: 0,
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('rentease-cart');
      if (savedCart) {
        const items = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: items });
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  }, []);

  // Save cart to localStorage on changes
  useEffect(() => {
    try {
      localStorage.setItem('rentease-cart', JSON.stringify(state.items));
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  }, [state.items]);

  const addItem = (item: CartItem) =>
    dispatch({ type: 'ADD_ITEM', payload: item });

  const removeItem = (productId: string) =>
    dispatch({ type: 'REMOVE_ITEM', payload: productId });

  const updateTenure = (productId: string, tenure: number) =>
    dispatch({ type: 'UPDATE_TENURE', payload: { productId, tenure } });

  const updateQuantity = (productId: string, quantity: number) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });

  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        ...state,
        addItem,
        removeItem,
        updateTenure,
        updateQuantity,
        clearCart,
        itemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
