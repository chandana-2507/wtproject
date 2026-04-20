import { createSlice } from '@reduxjs/toolkit';

const GUEST_CART_KEY = 'ecommerce_guest_cart_v1';

function readStorage() {
  try {
    const raw = localStorage.getItem(GUEST_CART_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeStorage(items) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items));
}

const initialState = {
  guestItems: readStorage(),
};

const cartSlice = createSlice({
  name: 'cartGuest',
  initialState,
  reducers: {
    guestAddItem(state, action) {
      const { product, qty } = action.payload;
      const id = product._id;
      const line = state.guestItems.find((i) => i.productId === id);
      if (line) {
        line.qty += qty;
        line.price = product.price;
        line.name = product.name;
        line.image = product.images?.[0]?.url || '';
      } else {
        state.guestItems.push({
          productId: id,
          qty,
          price: product.price,
          name: product.name,
          image: product.images?.[0]?.url || '',
        });
      }
      writeStorage(state.guestItems);
    },
    guestUpdateQty(state, action) {
      const { productId, qty } = action.payload;
      const line = state.guestItems.find((i) => i.productId === productId);
      if (line) {
        line.qty = qty;
        if (line.qty < 1) {
          state.guestItems = state.guestItems.filter((i) => i.productId !== productId);
        }
        writeStorage(state.guestItems);
      }
    },
    guestRemoveItem(state, action) {
      const id = action.payload;
      state.guestItems = state.guestItems.filter((i) => i.productId !== id);
      writeStorage(state.guestItems);
    },
    guestClear(state) {
      state.guestItems = [];
      writeStorage(state.guestItems);
    },
  },
});

export const { guestAddItem, guestUpdateQty, guestRemoveItem, guestClear } = cartSlice.actions;
export const selectGuestCart = (s) => s.cartGuest.guestItems;
export default cartSlice.reducer;
