import { createSlice } from '@reduxjs/toolkit';

const ordersSlice = createSlice({
  name: 'orders',
  initialState: {
    successOrderId: null,
  },
  reducers: {
    setSuccessOrderId(state, action) {
      state.successOrderId = action.payload;
    },
    clearSuccessOrder(state) {
      state.successOrderId = null;
    },
  },
});

export const { setSuccessOrderId, clearSuccessOrder } = ordersSlice.actions;
export default ordersSlice.reducer;
