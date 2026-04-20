import { createSlice } from '@reduxjs/toolkit';

const productsSlice = createSlice({
  name: 'products',
  initialState: {
    listView: 'grid',
  },
  reducers: {
    setListView(state, action) {
      state.listView = action.payload;
    },
  },
});

export const { setListView } = productsSlice.actions;
export default productsSlice.reducer;
