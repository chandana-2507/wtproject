import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  user: null,
  loading: true,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action) {
      const u = action.payload;
      state.user = u;
      state.isAuthenticated = Boolean(u);
      state.loading = false;
    },
    setAuthLoading(state, action) {
      state.loading = action.payload;
    },
    logoutUser(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
  },
});

export const { setUser, setAuthLoading, logoutUser } = authSlice.actions;
export default authSlice.reducer;
