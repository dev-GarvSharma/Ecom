import { createSlice } from '@reduxjs/toolkit';

const loadWishlist = () => {
  try {
    return JSON.parse(localStorage.getItem('velvet-wishlist')) || [];
  } catch {
    return [];
  }
};

const persist = (items) => localStorage.setItem('velvet-wishlist', JSON.stringify(items));

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: loadWishlist() },
  reducers: {
    toggleWishlist: (state, action) => {
      const exists = state.items.some((item) => item.id === action.payload.id);
      state.items = exists ? state.items.filter((item) => item.id !== action.payload.id) : [...state.items, action.payload];
      persist(state.items);
    },
    removeWishlist: (state, action) => {
      state.items = state.items.filter((item) => item.id !== action.payload);
      persist(state.items);
    },
  },
});

export const { toggleWishlist, removeWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
