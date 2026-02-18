import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";

export interface Connection {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  image?: string;
}

interface ConnectionsState {
  connections: Connection[];
  loading: boolean;
  error: string | null;
}

const initialState: ConnectionsState = {
  connections: [],
  loading: false,
  error: null,
};

export const fetchConnections = createAsyncThunk(
  "connections/fetchConnections",
  async (_, { rejectWithValue }) => {
    try {
      const res = await axios.get("/api/connections");
      return res.data.data as Connection[];
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch connections",
      );
    }
  },
);

export const removeConnection = createAsyncThunk(
  "connections/removeConnection",
  async (connectionId: string, { rejectWithValue }) => {
    try {
      await axios.delete(`/api/connections/${connectionId}`);
      return connectionId;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to remove connection",
      );
    }
  },
);

const connectionsSlice = createSlice({
  name: "connections",
  initialState,
  reducers: {
    clearConnectionsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConnections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchConnections.fulfilled,
        (state, action: PayloadAction<Connection[]>) => {
          state.connections = action.payload;
          state.loading = false;
        },
      )
      .addCase(fetchConnections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(removeConnection.pending, (state) => {
        state.error = null;
      })
      .addCase(
        removeConnection.fulfilled,
        (state, action: PayloadAction<string>) => {
          state.connections = state.connections.filter(
            (c) => c._id !== action.payload,
          );
        },
      )
      .addCase(removeConnection.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearConnectionsError } = connectionsSlice.actions;
export default connectionsSlice.reducer;
