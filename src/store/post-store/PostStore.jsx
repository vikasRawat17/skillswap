import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const API = "https://skillswapserver.onrender.com/api";

const initialState = {
  currentSkill: null,
  isLoading: false,
  matchStatus: "idle",
  matches: [],
  offerers: null,
  seekers: null,
  data: [],
  mutualMatches: [],
  error: null,
};

export const skillAsyncThunk = createAsyncThunk(
  "skill/fetchSkills",
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState();
      const token = state.authReducer.token;

      const response = await fetch(`${API}/skills/all`, {
        method: "GET",
        headers: {
          Authorization: token,
        },
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        throw new Error(errorMessage || "Failed to fetch skills");
      }

      const data = await response.json();

      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.message);
    }
  }
);

export const postSkill = createAsyncThunk(
  "skills/postSkill",
  async (skillData, thunkAPI) => {
    const { rejectWithValue, getState } = thunkAPI;
    const token = getState().authReducer.token;
    try {
      // Check if we're updating (has _id) or creating
      const isUpdate = !!skillData._id;
      let response;

      if (isUpdate) {
        const skillId = skillData._id;
        // Remove _id from the request body
        const { _id, ...updateData } = skillData;

        response = await axios.put(`${API}/skills/${skillId}`, updateData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        });
      } else {
        response = await axios.post(`${API}/skills`, skillData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: token,
          },
        });
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to save skill");
    }
  }
);

export const deleteSkill = createAsyncThunk(
  "skills/deleteSkill",
  async (skillId, thunkAPI) => {
    const { rejectWithValue, getState } = thunkAPI;
    const token = getState().authReducer.token;
    try {
      const response = await axios.delete(`${API}/skills/${skillId}`, {
        headers: {
          Authorization: token,
        },
      });

      return { skillId };
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to delete skill");
    }
  }
);

export const findMatches = createAsyncThunk(
  "skills/findMatches",
  async (params, thunkAPI) => {
    const { rejectWithValue, getState } = thunkAPI;
    const token = getState().authReducer.token;
    try {
      const response = await axios.get(`${API}/skills/match`, {
        headers: {
          Authorization: token,
        },
        params,
      });
      console.log(response.data);

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to find matches");
    }
  }
);

export const getMutualMatches = createAsyncThunk(
  "skills/getMutualMatches",
  async (_, thunkAPI) => {
    const { rejectWithValue, getState } = thunkAPI;
    const token = getState().authReducer.token;
    try {
      const response = await axios.get(`${API}/skills/mutual-matches`, {
        headers: {
          Authorization: token,
        },
      });
      console.log("mutual-matches from API", response.data);

      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data || "Failed to get mutual matches"
      );
    }
  }
);

export const getMatches = createAsyncThunk(
  "skills/getMatches",
  async (query, thunkAPI) => {
    const { rejectWithValue, getState } = thunkAPI;
    const token = getState().authReducer.token;
    try {
      const response = await axios.get(
        `${API}/skills/matches?skillName=${query.skillName}&type=${query.type}`,
        {
          headers: {
            Authorization: token,
          },
        }
      );

      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || "Failed to get  matches");
    }
  }
);

const skillSlice = createSlice({
  name: "skills",
  initialState,
  reducers: {
    resetSkillState: (state) => {
      state.currentSkill = null;
      state.matchStatus = "idle";
      state.matchedUsers = [];
      state.data = [];
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(postSkill.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(postSkill.fulfilled, (state, action) => {
      state.isLoading = false;
      state.currentSkill = action.payload;
    });
    builder.addCase(postSkill.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || "Failed to post skill";
    });

    builder.addCase(deleteSkill.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteSkill.fulfilled, (state, action) => {
      state.isLoading = false;

      if (action.payload && action.payload.skillId) {
        // Remove the deleted skill from the data array
        state.data = state.data.filter(
          (skill) => skill._id !== action.payload.skillId
        );
      } else if (action.payload && typeof action.payload === "string") {
        // If payload is just the ID string itself
        state.data = state.data.filter((skill) => skill._id !== action.payload);
      }
      // Clear any existing errors
      state.error = null;
    });
    builder.addCase(deleteSkill.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload || "Failed to delete skill";
    });

    builder.addCase(findMatches.pending, (state) => {
      state.matchStatus = "loading";
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(findMatches.fulfilled, (state, action) => {
      state.isLoading = false;
      state.matchStatus = action.payload.length > 0 ? "success" : "not-found";
      state.matchedUsers = action.payload;
    });
    builder.addCase(findMatches.rejected, (state, action) => {
      state.isLoading = false;
      state.matchStatus = "error";
      state.error = action.payload || "Failed to find matches";
    });

    builder.addCase(getMutualMatches.pending, (state) => {
      state.isLoading = true;
      state.matchStatus = "loading";
      state.error = null;
    });
    builder.addCase(getMutualMatches.fulfilled, (state, action) => {
      state.isLoading = false;
      state.matches = action.payload;
      state.matchStatus = action.payload.success ? "success" : "not-found";
      state.matchedUsers = action.payload;
    });

    builder.addCase(getMutualMatches.rejected, (state, action) => {
      state.isLoading = false;
      state.matchStatus = "error";
      state.error = action.payload || "Failed to get mutual matches";
    });

    builder
      .addCase(skillAsyncThunk.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(skillAsyncThunk.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload.result;
        state.error = null;
      })
      .addCase(skillAsyncThunk.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(getMatches.pending, (state) => {
        state.isLoading = true;
        state.matchStatus = "loading";
        state.error = null;
      })
      .addCase(getMatches.fulfilled, (state, action) => {
        state.isLoading = false;
        state.matches = action.payload;
        state.matchStatus = action.payload.success ? "success" : "not-found";
        state.matchedUsers = action.payload;
      })
      .addCase(getMatches.rejected, (state, action) => {
        state.isLoading = false;
        state.matchStatus = "error";
        state.error = action.payload || "Failed to find matches";
      });
  },
});

export const { resetSkillState } = skillSlice.actions;
export default skillSlice.reducer;
