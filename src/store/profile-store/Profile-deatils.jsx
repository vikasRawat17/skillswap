import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const API_URL = "https://skillswapserver.onrender.com/api";

const INITIAL_STATE = {
  loading: false,
  profileData: null,
  error: null,
};

export const fetchProfileDetails = createAsyncThunk(
  "profile/fetchDetails",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.authReducer.token;

      const response = await fetch(`${API_URL}/users/profile-details/me`, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Failed to fetch profile");
      }

      const data = await response.json();

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const saveProfileDetails = createAsyncThunk(
  "profile/saveDetails",
  async (profileDetails, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.authReducer.token;

      const response = await fetch(`${API_URL}/users/profile-details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token,
        },
        body: JSON.stringify(profileDetails),
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Failed to save profile");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

const profileSlice = createSlice({
  name: "profile",
  initialState: INITIAL_STATE,
  reducers: {
    resetProfileState: (state) => {
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProfileDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfileDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.profileData = action.payload;
        state.error = null;
      })
      .addCase(fetchProfileDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(saveProfileDetails.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(saveProfileDetails.fulfilled, (state, action) => {
        state.loading = false;
        state.profileData = action.payload;
        state.error = null;
      })
      .addCase(saveProfileDetails.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetProfileState } = profileSlice.actions;
export default profileSlice.reducer;
