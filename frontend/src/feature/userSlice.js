import { createSlice } from "@reduxjs/toolkit";

const persistedUser = (() => {
  try {
    const u = localStorage.getItem("user");
    return u ? JSON.parse(u) : null;
  } catch {
    return null;
  }
})();

const persistedToken = localStorage.getItem("token") || null;

const initialState = {
  user: persistedUser,
  token: persistedToken,
  loading: true,
};

export const userSlice = createSlice({
  name: "user",
  initialState,

  reducers: {
    login: (state, action) => {
      // payload: { user: { ... }, token }
      const { user, token } = action.payload;
      state.user = user;
      state.token = token || state.token;
      state.loading = false;

      try {
        if (token) localStorage.setItem("token", token);
        if (user) localStorage.setItem("user", JSON.stringify(user));
      } catch (e) {
        console.error("Failed to persist auth to localStorage", e);
      }
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch (e) {
        /* ignore */
      }
    },

    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { login, logout, setLoading } = userSlice.actions;

export const selectUser = (state) => state.user.user;
export const selectUserToken = (state) => state.user.token;
export const selectUserLoading = (state) => state.user.loading;

export default userSlice.reducer;
