import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface AdminState {
  isLoading: boolean;
  error: string | null;
  successMessage: string | null;
}

interface CreateUserPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  address?: string;
}

interface ApiError {
  message: string;
}

const initialState: AdminState = {
  isLoading: false,
  error: null,
  successMessage: null,
};

export const createUserByAdmin = createAsyncThunk<
  { message: string },
  CreateUserPayload,
  { rejectValue: ApiError }
>("admin/createUser", async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post("/api/admin/users/create-user", data);

    return {
      message: res.data.message,
    };
  } catch (err: any) {
    return rejectWithValue({
      message: err.response?.data?.message || "Failed to create user",
    });
  }
});

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    clearAdminState(state) {
      state.error = null;
      state.successMessage = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createUserByAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createUserByAdmin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload.message;
      })
      .addCase(createUserByAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || null;
      });
  },
});

export const { clearAdminState } = adminSlice.actions;
export default adminSlice.reducer;
