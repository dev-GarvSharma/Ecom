import { createSlice } from '@reduxjs/toolkit';

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    cartOpen: false,
    searchOpen: false,
    quickView: null,
    darkMode: (() => {
      const savedTheme = localStorage.getItem('velvet-theme');
      return savedTheme ? savedTheme === 'dark' : true;
    })(),
    toast: '',
  },
  reducers: {
    setCartOpen: (state, action) => {
      state.cartOpen = action.payload;
    },
    setSearchOpen: (state, action) => {
      state.searchOpen = action.payload;
    },
    setQuickView: (state, action) => {
      state.quickView = action.payload;
    },
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('velvet-theme', state.darkMode ? 'dark' : 'light');
    },
    showToast: (state, action) => {
      state.toast = action.payload;
    },
    hideToast: (state) => {
      state.toast = '';
    },
  },
});

export const { setCartOpen, setSearchOpen, setQuickView, toggleDarkMode, showToast, hideToast } = uiSlice.actions;
export default uiSlice.reducer;
