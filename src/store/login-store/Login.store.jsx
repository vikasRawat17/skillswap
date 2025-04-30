import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_URL = "https://skillswapserver.onrender.com/api";

const INITIAL_STATE = {
  isAuthenticated: false,
  email: null,
  user: null,
  token: null,
  error: null,
  loading: null,
};

export const userAsyncThunk = createAsyncThunk(
  "auth/login",
  async (userCreds, thunkAPI) => {
    try {
      const response = await fetch(`${API_URL}/users/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userCreds),
      });

      const data = await response.json();

      if (!response.ok) {
        return thunkAPI.rejectWithValue({
          status: response.status,
          message: data.message || "Invalid credentials",
        });
      }

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue({
        status: 500,
        message: error.message || "Network error",
      });
    }
  }
);

export const registerAsyncThunk = createAsyncThunk(
  "auth/register",
  async (userData, thunkAPI) => {
    try {
      const response = await fetch(`${API_URL}/users/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        let errorData;
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          errorData = await response.json();
          return thunkAPI.rejectWithValue({ message: errorData.error });
        } else {
          const errorText = await response.text();
          console.log("Text error data:", errorText);
          return thunkAPI.rejectWithValue({ message: errorText });
        }
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue({ message: error.message });
    }
  }
);

export const forgotPassThunk = createAsyncThunk(
  "forgot/pass",
  async ({ email, otp }, thunkAPI) => {
    try {
      const response = await fetch(`${API_URL}/users/forgot-pass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Something went wrong");
      }

      const message = await response.json();
      return { email, message };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const changePassThunk = createAsyncThunk(
  "change/pass",
  async (data, thunkAPI) => {
    try {
      const response = await fetch(`${API_URL}/users/change-pass`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          newPassword: data.password,
        }),
      });
      const message = await response.json();
      return message;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: INITIAL_STATE,
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.email = null;
      state.token = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(userAsyncThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(userAsyncThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.error = null;
      })
      .addCase(userAsyncThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload.message;
      })

      .addCase(registerAsyncThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(registerAsyncThunk.fulfilled, (state, action) => {
        state.token = action.payload.token || null;
        state.error = null;
        state.loading = false;
      })
      .addCase(registerAsyncThunk.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      })
      .addCase(forgotPassThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(forgotPassThunk.fulfilled, (state, action) => {
        state.email = action.payload.email;
        state.error = null;
        state.loading = false;
      })
      .addCase(forgotPassThunk.rejected, (state, action) => {
        state.error = action.payload || "An error occurred";
        state.loading = false;
      })
      .addCase(changePassThunk.pending, (state) => {
        state.loading = true;
      })
      .addCase(changePassThunk.fulfilled, (state) => {
        state.error = null;
        state.loading = false;
      })
      .addCase(changePassThunk.rejected, (state, action) => {
        state.error = action.payload;
        state.loading = false;
      });
  },
});

export const authReducer = authSlice.reducer;
export const authSelector = (state) => {
  return state.authReducer;
};
export const authActions = authSlice.actions;
