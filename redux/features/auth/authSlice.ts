import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface AuthState {
  isLoading: boolean;
  user: any | null;
  resetToken: string | null;
  error: string | null;
  successMessage: string | null;
}

interface forgotPassword {
  email: string;
}

interface ApiError {
  message: string;
}

interface GoogleLoginResponse {
  data: any;
  message: string;
}

interface GithubLoginResponse {
  data: any;
  message: string;
}

const initialState: AuthState = {
  isLoading: false,
  user: null,
  resetToken: null,
  error: null,
  successMessage: null,
};

export const forgotPassword = createAsyncThunk<
  string,
  { email: string },
  { rejectValue: ApiError }
>("auth/forgotPassword", async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post("/api/auth/forgot-password", data);
    return res.data.message;
  } catch (err: any) {
    return rejectWithValue({
      message: err.response?.data?.message || "Failed to send OTP",
    });
  }
});

export const verifyOtp = createAsyncThunk<
  { resetToken: string },
  { email: string; otp: string },
  { rejectValue: ApiError }
>("auth/verifyOtp", async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post("/api/auth/verify-forgot-otp", data);
    return res.data.data;
  } catch (err: any) {
    return rejectWithValue({
      message: err.response?.data?.message || "OTP verification failed",
    });
  }
});

export const resetPassword = createAsyncThunk<
  string,
  { resetToken: string; newPassword: string },
  { rejectValue: ApiError }
>("auth/resetPassword", async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post("/api/auth/reset-password", data);
    return res.data.message;
  } catch (err: any) {
    return rejectWithValue({
      message: err.response?.data?.message || "Password reset failed",
    });
  }
});

export const googleLogin = createAsyncThunk<
  GoogleLoginResponse,
  { token: string },
  { rejectValue: ApiError }
>("auth/googleLogin", async (data, { rejectWithValue }) => {
  try {
    const res = await axios.post("/api/auth/google", data);
    return res.data;
  } catch (error: any) {
    return rejectWithValue({
      message: error.response?.data?.message || "Google login failed",
    });
  }
});

export const githubLogin = createAsyncThunk<
  GithubLoginResponse,
  { code: string },
  { rejectValue: ApiError }
>(
  "auth/githubLogin",
  async ({ code }: { code: string }, { rejectWithValue }) => {
    try {
      const res = await axios.post("/api/auth/github", { code });

      const data = await res.data;

      return data;
    } catch (error: any) {
      return rejectWithValue({
        message: error.response?.data?.message || "Github login failed.",
      });
    }
  },
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    clearUser(state) {
      state.user = null;
    },
    clearAuthState(state) {
      state.error = null;
      state.successMessage = null;
      state.isLoading = false;
    },
  },
  extraReducers: (builder) => {
    builder

      .addCase(forgotPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload;
      })
      .addCase(forgotPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || null;
      })

      .addCase(verifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        state.resetToken = action.payload.resetToken;
        state.successMessage = "OTP verified successfully";
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || null;
      })

      .addCase(resetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = action.payload;
        state.resetToken = null;
      })
      .addCase(resetPassword.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || null;
      })

      .addCase(googleLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(googleLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data;
        state.error = null;
      })
      .addCase(googleLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message ?? null;
      })
      .addCase(githubLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(githubLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.data;
        state.error = null;
      })
      .addCase(githubLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message ?? null;
      });
  },
});

export const { setUser, clearUser, clearAuthState } = authSlice.actions;
export default authSlice.reducer;
