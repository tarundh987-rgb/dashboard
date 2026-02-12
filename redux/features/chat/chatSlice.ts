import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ChatState {
  selectedConversationId: string | null;
}

const initialState: ChatState = {
  selectedConversationId: null,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    selectConversation: (state, action: PayloadAction<string | null>) => {
      state.selectedConversationId = action.payload;
    },
    clearSelection: (state) => {
      state.selectedConversationId = null;
    },
  },
});

export const { selectConversation, clearSelection } = chatSlice.actions;
export default chatSlice.reducer;
