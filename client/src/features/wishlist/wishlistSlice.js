import { createSlice } from '@reduxjs/toolkit';

const KEY = 'ecommerce_guest_wishlist_v1';

function readIds() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeIds(ids) {
  localStorage.setItem(KEY, JSON.stringify(ids));
}

const wishlistSlice = createSlice({
  name: 'wishlistLocal',
  initialState: {
    guestIds: readIds(),
  },
  reducers: {
    guestToggleId(state, action) {
      const id = action.payload;
      const pos = state.guestIds.indexOf(id);
      if (pos >= 0) state.guestIds.splice(pos, 1);
      else state.guestIds.push(id);
      writeIds(state.guestIds);
    },
    guestSetIds(state, action) {
      state.guestIds = action.payload;
      writeIds(state.guestIds);
    },
  },
});

export const { guestToggleId, guestSetIds } = wishlistSlice.actions;
export const selectGuestWishlistIds = (s) => s.wishlistLocal.guestIds;
export default wishlistSlice.reducer;
